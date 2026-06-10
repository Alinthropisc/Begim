"""CashProvider — оплата при получении.

Никаких внешних API. `create_checkout` отдаёт «псевдо-URL» для UI (фронт может
показать инструкцию). Webhook не используется.

В стейте платёж сразу становится AUTHORIZED — деньги ещё не переданы, но
покупатель подтвердил намерение. Подтверждение фактической оплаты происходит
вручную через `OrderService.transition(... DELIVERED)`: в этом переходе
PaymentService потом будет переключать платёж в PAID отдельной таской.
"""

from __future__ import annotations

from typing import Any

from models.order import Order
from models.payment import Payment
from services.payments.base import CheckoutLink, PaymentProvider, WebhookOutcome


class CashProvider(PaymentProvider):
    name = "cash"

    async def create_checkout(self, order: Order, payment: Payment) -> CheckoutLink:
        return CheckoutLink(
            url=f"begim://cash/{order.id}",
            extra={"instruction": "Оплата наличными при получении"},
        )

    async def verify_webhook(self, headers: dict[str, str], raw_body: bytes) -> bool:
        return False  # вебхуков нет

    async def handle_webhook(self, payload: dict[str, Any]) -> WebhookOutcome:
        return WebhookOutcome(event="ignored")
