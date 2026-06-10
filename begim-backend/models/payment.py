"""Payment — платёж по заказу.

Один заказ может иметь несколько Payment (повторная попытка после fail).
`raw_payload` — последнее тело webhook'а провайдера (JSON), для расследований.

Поведение конкретного провайдера живёт в Strategy (`services/payments/*`),
модель остаётся провайдер-агностичной.
"""
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import Currency, PaymentProvider, PaymentStatus

if TYPE_CHECKING:
    from models.order import Order


class Payment(Base, IdMixin, TimestampMixin):
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    provider: Mapped[PaymentProvider] = mapped_column(
        SAEnum(PaymentProvider, name="payment_provider", native_enum=False, length=16),
        index=True,
    )
    status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus, name="payment_status", native_enum=False, length=16),
        default=PaymentStatus.PENDING,
        server_default=PaymentStatus.PENDING.value,
        index=True,
    )

    amount_minor: Mapped[int] = mapped_column(BigInteger)
    currency: Mapped[Currency] = mapped_column(
        SAEnum(Currency, name="currency", native_enum=False, length=8),
        default=Currency.UZS,
        server_default=Currency.UZS.value,
    )

    external_id: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)  # id у провайдера
    checkout_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    failure_reason: Mapped[str | None] = mapped_column(String(256), nullable=True)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    order: Mapped["Order"] = relationship()
