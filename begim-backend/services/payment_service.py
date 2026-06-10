"""PaymentService — оркестрирует Payment вокруг Order + Strategy провайдеров.

Use cases:
- `create_payment(order_id, provider, actor)` — создать платёж и вернуть
  `checkout_url`. Гарантия: один активный платёж (PENDING/AUTHORIZED) на заказ;
  если есть — повторно возвращаем его checkout_url, не плодим дубли.
- `handle_webhook(provider, headers, raw_body, payload)` — делегирует Strategy,
  применяет доменное действие к заказу (paid → переход в ACCEPTED), стреляет
  событие arq.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from loguru import logger

from models.enums import (
    OrderStatus,
    PaymentProvider as PaymentProviderEnum,
    PaymentStatus,
    UserRole,
)
from models.order import Order
from models.order import OrderStatusLog
from models.payment import Payment
from repositories import UnitOfWork
from services.payments import CheckoutLink, WebhookOutcome, get_provider


class PaymentError(Exception):
    pass


class PaymentOrderNotFound(PaymentError):
    pass


class PaymentForbidden(PaymentError):
    pass


class PaymentInvalidState(PaymentError):
    pass


@dataclass(slots=True)
class CreatePaymentResult:
    payment: Payment
    checkout: CheckoutLink


class PaymentService:
    def __init__(self, uow_factory=UnitOfWork, enqueue_event=None) -> None:
        self._uow_factory = uow_factory
        self._enqueue_event = enqueue_event

    # ----- create -----

    async def create_payment(
        self,
        order_id: int,
        provider: PaymentProviderEnum,
        actor_user_id: int,
    ) -> CreatePaymentResult:
        async with self._uow_factory() as uow:
            order = await uow.orders.get_with_items(order_id)
            if order is None:
                raise PaymentOrderNotFound("order not found")
            if order.buyer_id != actor_user_id:
                raise PaymentForbidden("only buyer can pay")
            if order.status in (OrderStatus.CANCELLED, OrderStatus.REFUNDED, OrderStatus.DELIVERED):
                raise PaymentInvalidState(f"cannot pay order in status {order.status.value}")

            existing = await uow.payments.find_active_for_order(order_id)
            provider_impl = get_provider(provider)

            if existing is not None and existing.provider == provider:
                # Идемпотентность: тот же провайдер + тот же заказ → отдаём существующий checkout
                checkout = await provider_impl.create_checkout(order, existing)
                existing.checkout_url = checkout.url
                await uow.flush()
                return CreatePaymentResult(payment=existing, checkout=checkout)

            payment = Payment(
                order_id=order.id,
                provider=provider,
                status=PaymentStatus.PENDING,
                amount_minor=order.total_minor,
                currency=order.currency,
            )
            uow.session.add(payment)
            await uow.flush()

            checkout = await provider_impl.create_checkout(order, payment)
            payment.checkout_url = checkout.url
            await uow.flush()
            return CreatePaymentResult(payment=payment, checkout=checkout)

    # ----- read -----

    async def get(self, payment_id: int, actor_user_id: int, role: UserRole) -> Payment:
        async with self._uow_factory() as uow:
            payment = await uow.payments.get_by_id(payment_id)
            if payment is None:
                raise PaymentOrderNotFound("payment not found")
            order = await uow.orders.get_by_id(payment.order_id)
            if order is None:
                raise PaymentOrderNotFound("order missing")
            if role == UserRole.ADMIN:
                return payment
            if order.buyer_id == actor_user_id:
                return payment
            seller = await uow.sellers.get_by_user_id(actor_user_id)
            if seller is not None and seller.id == order.seller_id:
                return payment
            raise PaymentForbidden("not your payment")

    # ----- webhook -----

    async def handle_webhook(
        self,
        provider: PaymentProviderEnum,
        headers: dict[str, str],
        raw_body: bytes,
        payload: dict[str, Any],
    ) -> Any:
        impl = get_provider(provider)
        if not await impl.verify_webhook(headers, raw_body):
            logger.warning("{} webhook signature invalid", provider.value)
            return {"error": "unauthorized"}

        outcome: WebhookOutcome = await impl.handle_webhook(payload)
        await self._apply_outcome(outcome)
        return outcome.response_body

    async def _apply_outcome(self, outcome: WebhookOutcome) -> None:
        """Доменная реакция на событие платежа.

        paid       → автоперевод заказа в ACCEPTED (если он ещё NEW)
        cancelled  → ничего автоматически (продавец может ручно отменить)
        refunded   → заказ в REFUNDED
        """
        if outcome.event in ("ignored", "authorized"):
            return
        if outcome.payment_external_id is None:
            return

        async with self._uow_factory() as uow:
            payment = await uow.payments.get_by_external_id(outcome.payment_external_id)
            if payment is None:
                return
            order = await uow.orders.get_by_id(payment.order_id)
            if order is None:
                return

            event = outcome.event
            if event == "paid" and order.status == OrderStatus.NEW:
                self._transition_order(order, OrderStatus.ACCEPTED, "auto: payment received")
            elif event == "refunded" and order.status != OrderStatus.REFUNDED:
                self._transition_order(order, OrderStatus.REFUNDED, "auto: payment refunded")

            await uow.flush()
            evt_for_arq = event
            order_id = order.id
            buyer_id = order.buyer_id

        if self._enqueue_event is not None:
            try:
                if evt_for_arq == "paid":
                    await self._enqueue_event(
                        "payment_paid",
                        order_id=order_id,
                        buyer_id=buyer_id,
                    )
                elif evt_for_arq == "refunded":
                    await self._enqueue_event(
                        "order_status_changed",
                        order_id=order_id,
                        buyer_id=buyer_id,
                        from_status="paid",
                        to_status="refunded",
                    )
            except Exception as e:  # noqa: BLE001
                logger.warning("enqueue payment event failed: {}", e)

    # ----- helpers -----

    def _transition_order(self, order: Order, to_status: OrderStatus, note: str) -> None:
        prev = order.status
        order.status = to_status
        order.status_logs.append(
            OrderStatusLog(
                order_id=order.id,
                from_status=prev,
                to_status=to_status,
                actor_user_id=None,  # системное действие
                note=note,
            )
        )
