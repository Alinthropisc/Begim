"""Payme провайдер (Paycom).

Checkout URL по официальной спеке:
    https://checkout.paycom.uz/<base64('m=<merchant>;ac.order_id=<id>;a=<amount_tiyin>')>

Аутентификация вебхука: HTTP Basic. Логин = "Paycom", пароль = `PAYME_SECRET_KEY`
(он же даётся в кабинете мерчанта). Иначе 401 без обработки.

JSON-RPC методы (минимально достаточный набор для прохождения интеграции):
- `CheckPerformTransaction`  — пред-проверка: заказ существует, сумма совпадает,
                               можно оплатить (статус ≠ CANCELLED/REFUNDED).
- `CreateTransaction`        — создание Paycom-транзакции, мапим её id в Payment.
- `PerformTransaction`       — деньги списаны → Payment=PAID.
- `CancelTransaction`        — отмена/возврат.
- `CheckTransaction`         — справочный.

Документация ошибок:
- -31001 wrong amount
- -31050..-31099 wrong account fields
- -31003 transaction not found
- -31007 cannot perform (state mismatch)
- -31008 cannot cancel
"""

from __future__ import annotations

import base64
import time
from typing import Any

from loguru import logger

from app.config import settings
from database import db_session
from models.enums import OrderStatus, PaymentStatus
from models.order import Order
from models.payment import Payment
from services.payments.base import CheckoutLink, PaymentProvider, WebhookOutcome


# Payme штампы времени — миллисекунды.
def _now_ms() -> int:
    return int(time.time() * 1000)


class PaymeProvider(PaymentProvider):
    name = "payme"

    def __init__(
        self,
        merchant_id: str | None = None,
        secret_key: str | None = None,
        endpoint: str | None = None,
    ) -> None:
        self.merchant_id = merchant_id or settings.payme_merchant_id or ""
        self.secret_key = secret_key or settings.payme_secret_key or ""
        self.endpoint = endpoint or settings.payme_endpoint

    # ----- checkout -----

    async def create_checkout(self, order: Order, payment: Payment) -> CheckoutLink:
        if not self.merchant_id:
            raise RuntimeError("PAYME_MERCHANT_ID не настроен")
        # base64('m=<merchant>;ac.order_id=<id>;a=<amount_tiyin>')
        # amount_tiyin = total_minor (мы уже храним в тийинах).
        raw = f"m={self.merchant_id};ac.order_id={order.id};a={payment.amount_minor}"
        b64 = base64.b64encode(raw.encode("utf-8")).decode("ascii")
        url = f"{self.endpoint.rstrip('/')}/{b64}"
        return CheckoutLink(url=url, extra={"merchant_id": self.merchant_id})

    # ----- webhook auth -----

    async def verify_webhook(self, headers: dict[str, str], raw_body: bytes) -> bool:
        if not self.secret_key:
            logger.warning("Payme webhook: PAYME_SECRET_KEY не задан")
            return False
        auth = headers.get("authorization") or headers.get("Authorization")
        if not auth or not auth.lower().startswith("basic "):
            return False
        try:
            decoded = base64.b64decode(auth[6:]).decode("utf-8")
        except Exception:
            return False
        if ":" not in decoded:
            return False
        login, password = decoded.split(":", 1)
        # Спека: логин "Paycom" + пароль = SECRET_KEY мерчанта.
        return login == "Paycom" and password == self.secret_key

    # ----- JSON-RPC dispatcher -----

    async def handle_webhook(self, payload: dict[str, Any]) -> WebhookOutcome:
        method = payload.get("method")
        params = payload.get("params") or {}
        rpc_id = payload.get("id")

        handler = {
            "CheckPerformTransaction": self._check_perform,
            "CreateTransaction": self._create_tx,
            "PerformTransaction": self._perform_tx,
            "CancelTransaction": self._cancel_tx,
            "CheckTransaction": self._check_tx,
        }.get(method)

        if handler is None:
            return WebhookOutcome(
                event="ignored",
                response_body=_jsonrpc_error(rpc_id, -32601, "Method not found"),
                raw=payload,
            )

        return await handler(rpc_id, params)

    # ----- methods -----

    async def _check_perform(self, rpc_id, params: dict[str, Any]) -> WebhookOutcome:
        order_id = (params.get("account") or {}).get("order_id")
        amount = params.get("amount")
        if order_id is None:
            return _err(rpc_id, -31050, "order_id missing", "ru")
        async with db_session() as session:
            order = await session.get(Order, int(order_id))
            if order is None:
                return _err(rpc_id, -31050, "order not found", "ru")
            if order.status in (OrderStatus.CANCELLED, OrderStatus.REFUNDED):
                return _err(rpc_id, -31008, "order is closed", "ru")
            if amount != order.total_minor:
                return _err(rpc_id, -31001, "wrong amount", "ru")
        return WebhookOutcome(
            event="ignored",
            response_body=_jsonrpc_ok(rpc_id, {"allow": True}),
        )

    async def _create_tx(self, rpc_id, params: dict[str, Any]) -> WebhookOutcome:
        order_id = (params.get("account") or {}).get("order_id")
        external_id = str(params.get("id"))
        amount = params.get("amount")
        create_time = params.get("time") or _now_ms()
        if order_id is None or external_id == "None":
            return _err(rpc_id, -31050, "bad params", "ru")

        async with db_session() as session:
            order = await session.get(Order, int(order_id))
            if order is None:
                return _err(rpc_id, -31050, "order not found", "ru")
            if order.total_minor != amount:
                return _err(rpc_id, -31001, "wrong amount", "ru")

            # Если для этой Paycom-транзакции уже есть Payment — отдаём её, идемпотентность.
            from sqlalchemy import select

            existing = (await session.execute(select(Payment).where(Payment.external_id == external_id))).scalar_one_or_none()

            if existing is None:
                existing = Payment(
                    order_id=order.id,
                    provider="payme",
                    status=PaymentStatus.AUTHORIZED,
                    amount_minor=amount,
                    external_id=external_id,
                    raw_payload=params,
                )
                session.add(existing)
                await session.flush()

            return WebhookOutcome(
                event="authorized",
                payment_external_id=external_id,
                response_body=_jsonrpc_ok(
                    rpc_id,
                    {
                        "transaction": str(existing.id),
                        "state": 1,
                        "create_time": create_time,
                    },
                ),
                raw=params,
            )

    async def _perform_tx(self, rpc_id, params: dict[str, Any]) -> WebhookOutcome:
        external_id = str(params.get("id"))
        from sqlalchemy import select

        async with db_session() as session:
            payment = (await session.execute(select(Payment).where(Payment.external_id == external_id))).scalar_one_or_none()
            if payment is None:
                return _err(rpc_id, -31003, "transaction not found", "ru")
            if payment.status == PaymentStatus.PAID:
                # идемпотентность — повторный PerformTransaction
                return WebhookOutcome(
                    event="ignored",
                    payment_external_id=external_id,
                    response_body=_jsonrpc_ok(
                        rpc_id,
                        {
                            "transaction": str(payment.id),
                            "state": 2,
                            "perform_time": _now_ms(),
                        },
                    ),
                )
            if payment.status != PaymentStatus.AUTHORIZED:
                return _err(rpc_id, -31008, "cannot perform from state", "ru")
            payment.status = PaymentStatus.PAID
            payment.raw_payload = params
            return WebhookOutcome(
                event="paid",
                payment_external_id=external_id,
                response_body=_jsonrpc_ok(
                    rpc_id,
                    {
                        "transaction": str(payment.id),
                        "state": 2,
                        "perform_time": _now_ms(),
                    },
                ),
                raw=params,
            )

    async def _cancel_tx(self, rpc_id, params: dict[str, Any]) -> WebhookOutcome:
        external_id = str(params.get("id"))
        from sqlalchemy import select

        async with db_session() as session:
            payment = (await session.execute(select(Payment).where(Payment.external_id == external_id))).scalar_one_or_none()
            if payment is None:
                return _err(rpc_id, -31003, "transaction not found", "ru")
            event = "refunded" if payment.status == PaymentStatus.PAID else "cancelled"
            payment.status = PaymentStatus.REFUNDED if event == "refunded" else PaymentStatus.CANCELLED
            payment.raw_payload = params
            return WebhookOutcome(
                event=event,
                payment_external_id=external_id,
                response_body=_jsonrpc_ok(
                    rpc_id,
                    {
                        "transaction": str(payment.id),
                        "state": -2 if event == "refunded" else -1,
                        "cancel_time": _now_ms(),
                    },
                ),
                raw=params,
            )

    async def _check_tx(self, rpc_id, params: dict[str, Any]) -> WebhookOutcome:
        external_id = str(params.get("id"))
        from sqlalchemy import select

        async with db_session() as session:
            payment = (await session.execute(select(Payment).where(Payment.external_id == external_id))).scalar_one_or_none()
            if payment is None:
                return _err(rpc_id, -31003, "transaction not found", "ru")
            state_map = {
                PaymentStatus.AUTHORIZED: 1,
                PaymentStatus.PAID: 2,
                PaymentStatus.CANCELLED: -1,
                PaymentStatus.REFUNDED: -2,
            }
            return WebhookOutcome(
                event="ignored",
                response_body=_jsonrpc_ok(
                    rpc_id,
                    {
                        "transaction": str(payment.id),
                        "state": state_map.get(payment.status, 0),
                        "create_time": _now_ms(),
                        "perform_time": _now_ms() if payment.status == PaymentStatus.PAID else 0,
                        "cancel_time": 0,
                    },
                ),
            )


# ----- JSON-RPC helpers -----


def _jsonrpc_ok(rpc_id, result: Any) -> dict:
    return {"jsonrpc": "2.0", "id": rpc_id, "result": result}


def _jsonrpc_error(rpc_id, code: int, message: str) -> dict:
    return {"jsonrpc": "2.0", "id": rpc_id, "error": {"code": code, "message": message}}


def _err(rpc_id, code: int, message: str, lang: str) -> WebhookOutcome:
    return WebhookOutcome(
        event="ignored",
        response_body={
            "jsonrpc": "2.0",
            "id": rpc_id,
            "error": {"code": code, "message": {lang: message, "ru": message, "uz": message, "en": message}},
        },
    )
