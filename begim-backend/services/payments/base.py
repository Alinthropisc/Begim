"""PaymentProvider — базовый Strategy интерфейс.

Каждый провайдер (Payme, Click, Cash, в будущем — Visa Hub, USDT) реализует
один и тот же контракт:
1. `create_checkout(order, payment)` → подготовить пейлоад для UI (например,
   URL для редиректа на checkout.paycom.uz). Не имеет права менять статус заказа.
2. `verify_webhook(request)` → проверить аутентичность входящего вебхука.
3. `handle_webhook(payload)` → распарсить тело и вернуть `WebhookOutcome` —
   доменное событие, которое PaymentService применит к платежу/заказу.

Так PaymentService **не знает деталей** конкретного провайдера. Добавить новый =
новый класс, регистрация в `registry.PROVIDERS`, ничего больше.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Literal

from models.order import Order
from models.payment import Payment


# ----- DTO -----


@dataclass(slots=True, frozen=True)
class CheckoutLink:
    """Что отдаём фронту, чтобы он повёл пользователя на оплату."""

    url: str
    # Доп. данные, если фронт хочет показать кнопки/инструкции (Click требует
    # сразу два параметра в URL — service_id и merchant_id, удобно вернуть оба).
    extra: dict[str, Any] = field(default_factory=dict)


WebhookEventType = Literal[
    "authorized",  # Payme CreateTransaction / Click Prepare — пользователь ввёл карту
    "paid",  # Payme PerformTransaction / Click Complete — деньги списаны
    "cancelled",  # отказ или возврат до paid
    "refunded",  # возврат после paid
    "ignored",  # вебхук валидный, но не требует доменного действия
]


@dataclass(slots=True, frozen=True)
class WebhookOutcome:
    """Доменное событие, извлечённое из вебхука."""

    event: WebhookEventType
    payment_external_id: str | None = None
    # Что вернуть провайдеру в HTTP-ответе (для Payme это JSON-RPC, для Click — XML/JSON).
    response_body: Any = None
    # raw для аудита.
    raw: dict[str, Any] = field(default_factory=dict)


# ----- Provider -----


class PaymentProvider(ABC):
    """Базовый класс. Все методы async, чтобы провайдер мог ходить во внешние API."""

    name: str  # должен совпадать с enum PaymentProvider.value

    @abstractmethod
    async def create_checkout(self, order: Order, payment: Payment) -> CheckoutLink: ...

    @abstractmethod
    async def verify_webhook(self, headers: dict[str, str], raw_body: bytes) -> bool:
        """True, если вебхук подписан правильно. Иначе — 401 без сохранения."""

    @abstractmethod
    async def handle_webhook(self, payload: dict[str, Any]) -> WebhookOutcome:
        """Распарсить тело и вернуть доменное событие + готовый response_body."""


class PaymentProviderError(Exception):
    """Провайдер не смог отработать (внешний API упал и т.д.) — HTTP 502."""
