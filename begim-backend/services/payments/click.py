"""Click провайдер.

Checkout URL (CLICK Pass для Mini App / Web):
    https://my.click.uz/services/pay?service_id=<X>&merchant_id=<Y>&amount=<sums>&transaction_param=<order_id>

Webhook от Click — form-encoded POST'ы, два callback'а:
- `action=0` Prepare    — Click создал транзакцию у себя, ждёт нашего OK.
- `action=1` Complete   — пользователь подтвердил оплату.

Аутентичность — md5 hex.
    sign_string = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
    (для action=1 формула с merchant_prepare_id; см. спеку)

Если sign не совпал → отвечаем error=-1 и НЕ трогаем БД.

Click работает в **сумах** (без тийинов в URL), поэтому `amount = total_minor // 100`.
"""
from __future__ import annotations

import hashlib
from typing import Any

from loguru import logger

from app.config import settings
from database import db_session
from models.enums import OrderStatus, PaymentStatus
from models.order import Order
from models.payment import Payment
from services.payments.base import CheckoutLink, PaymentProvider, WebhookOutcome


# Click error codes из доки.
ERR_OK = 0
ERR_SIGN_FAILED = -1
ERR_INVALID_AMOUNT = -2
ERR_ACTION_NOT_FOUND = -3
ERR_TRANSACTION_NOT_FOUND = -6
ERR_USER_DOES_NOT_EXIST = -5


class ClickProvider(PaymentProvider):
    name = "click"

    def __init__(
        self,
        merchant_id: str | None = None,
        service_id: str | None = None,
        secret_key: str | None = None,
        endpoint: str | None = None,
    ) -> None:
        self.merchant_id = merchant_id or settings.click_merchant_id or ""
        self.service_id = service_id or settings.click_service_id or ""
        self.secret_key = secret_key or settings.click_secret_key or ""
        self.endpoint = endpoint or settings.click_endpoint

    # ----- checkout -----

    async def create_checkout(self, order: Order, payment: Payment) -> CheckoutLink:
        if not (self.merchant_id and self.service_id):
            raise RuntimeError("CLICK_MERCHANT_ID/CLICK_SERVICE_ID не настроены")
        amount_sums = payment.amount_minor // 100  # тийины → сумы
        url = (
            "https://my.click.uz/services/pay"
            f"?service_id={self.service_id}"
            f"&merchant_id={self.merchant_id}"
            f"&amount={amount_sums}"
            f"&transaction_param={order.id}"
        )
        return CheckoutLink(
            url=url,
            extra={"service_id": self.service_id, "merchant_id": self.merchant_id},
        )

    # ----- webhook auth (Click — подпись внутри тела, headers не несут secret) -----

    async def verify_webhook(self, headers: dict[str, str], raw_body: bytes) -> bool:
        # Само тело — form-encoded. Подпись валидируем уже в handle_webhook
        # (нужны конкретные поля). Здесь — только заглушка для интерфейса.
        return True

    # ----- handle -----

    async def handle_webhook(self, payload: dict[str, Any]) -> WebhookOutcome:
        action = str(payload.get("action", ""))
        if action == "0":
            return await self._prepare(payload)
        if action == "1":
            return await self._complete(payload)
        return WebhookOutcome(
            event="ignored",
            response_body=_resp(payload, ERR_ACTION_NOT_FOUND, "Action not found"),
        )

    # ----- prepare (action=0) -----

    async def _prepare(self, p: dict[str, Any]) -> WebhookOutcome:
        if not self._verify_prepare_sign(p):
            return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_SIGN_FAILED, "SIGN CHECK FAILED!"))

        order_id = _int_or_none(p.get("merchant_trans_id"))
        amount_sums = _float_or_none(p.get("amount"))
        if order_id is None or amount_sums is None:
            return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_TRANSACTION_NOT_FOUND, "bad params"))

        async with db_session() as session:
            order = await session.get(Order, order_id)
            if order is None:
                return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_TRANSACTION_NOT_FOUND, "order not found"))
            if order.status in (OrderStatus.CANCELLED, OrderStatus.REFUNDED):
                return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_TRANSACTION_NOT_FOUND, "order closed"))
            if int(amount_sums * 100) != order.total_minor:
                return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_INVALID_AMOUNT, "wrong amount"))

            # Создаём/получаем Payment (AUTHORIZED).
            from sqlalchemy import select

            external_id = str(p.get("click_trans_id"))
            existing = (
                await session.execute(
                    select(Payment).where(Payment.external_id == external_id)
                )
            ).scalar_one_or_none()
            if existing is None:
                existing = Payment(
                    order_id=order.id,
                    provider="click",
                    status=PaymentStatus.AUTHORIZED,
                    amount_minor=order.total_minor,
                    external_id=external_id,
                    raw_payload=p,
                )
                session.add(existing)
                await session.flush()

        return WebhookOutcome(
            event="authorized",
            payment_external_id=external_id,
            response_body=_resp(
                p,
                ERR_OK,
                "Success",
                merchant_prepare_id=existing.id,
                merchant_trans_id=p.get("merchant_trans_id"),
            ),
            raw=p,
        )

    # ----- complete (action=1) -----

    async def _complete(self, p: dict[str, Any]) -> WebhookOutcome:
        if not self._verify_complete_sign(p):
            return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_SIGN_FAILED, "SIGN CHECK FAILED!"))

        external_id = str(p.get("click_trans_id"))
        error = _int_or_none(p.get("error", 0)) or 0

        async with db_session() as session:
            from sqlalchemy import select

            payment = (
                await session.execute(
                    select(Payment).where(Payment.external_id == external_id)
                )
            ).scalar_one_or_none()
            if payment is None:
                return WebhookOutcome(event="ignored", response_body=_resp(p, ERR_TRANSACTION_NOT_FOUND, "not found"))

            if error < 0:
                payment.status = PaymentStatus.CANCELLED
                payment.failure_reason = str(p.get("error_note", error))
                payment.raw_payload = p
                evt = "cancelled"
            else:
                # идемпотентность
                if payment.status != PaymentStatus.PAID:
                    payment.status = PaymentStatus.PAID
                payment.raw_payload = p
                evt = "paid"

        return WebhookOutcome(
            event=evt,
            payment_external_id=external_id,
            response_body=_resp(
                p,
                ERR_OK,
                "Success",
                merchant_confirm_id=payment.id,
                merchant_trans_id=p.get("merchant_trans_id"),
            ),
            raw=p,
        )

    # ----- signature -----

    def _verify_prepare_sign(self, p: dict[str, Any]) -> bool:
        # md5(click_trans_id + service_id + SECRET + merchant_trans_id + amount + action + sign_time)
        raw = (
            f"{p.get('click_trans_id','')}"
            f"{p.get('service_id','')}"
            f"{self.secret_key}"
            f"{p.get('merchant_trans_id','')}"
            f"{p.get('amount','')}"
            f"{p.get('action','')}"
            f"{p.get('sign_time','')}"
        )
        expected = hashlib.md5(raw.encode("utf-8")).hexdigest()
        return expected == str(p.get("sign_string", ""))

    def _verify_complete_sign(self, p: dict[str, Any]) -> bool:
        # md5(click_trans_id + service_id + SECRET + merchant_trans_id + merchant_prepare_id + amount + action + sign_time)
        raw = (
            f"{p.get('click_trans_id','')}"
            f"{p.get('service_id','')}"
            f"{self.secret_key}"
            f"{p.get('merchant_trans_id','')}"
            f"{p.get('merchant_prepare_id','')}"
            f"{p.get('amount','')}"
            f"{p.get('action','')}"
            f"{p.get('sign_time','')}"
        )
        expected = hashlib.md5(raw.encode("utf-8")).hexdigest()
        return expected == str(p.get("sign_string", ""))


# ----- helpers -----


def _resp(p: dict[str, Any], error: int, note: str, **extra) -> dict:
    base = {
        "click_trans_id": p.get("click_trans_id"),
        "merchant_trans_id": p.get("merchant_trans_id"),
        "error": error,
        "error_note": note,
    }
    base.update(extra)
    return base


def _int_or_none(v) -> int | None:
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def _float_or_none(v) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None
