"""Order + OrderItem + OrderStatusLog.

Денежные поля — в `*_minor` (тийины), целочисленно. Никакого float.

Атрибуция: `source_broadcast_id` — если заказ пришёл из лояльной рассылки,
запоминаем broadcast, чтобы считать конверсию. `source_channel_post_id` — если
из публикации в глобальном канале.

Состояние заказа меняется только через сервис `OrderService.transition()`,
который пишет переход в `OrderStatusLog` (аудит + цепочка событий для бота).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, DateTime, Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import Currency, OrderStatus

if TYPE_CHECKING:
    from models.seller_profile import SellerProfile
    from models.user import User


class Order(Base, IdMixin, TimestampMixin):
    # Стороны
    buyer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="RESTRICT"), index=True)

    # Суммы
    subtotal_minor: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    delivery_fee_minor: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    discount_minor: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    total_minor: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    currency: Mapped[Currency] = mapped_column(
        SAEnum(Currency, name="currency", native_enum=False, length=8),
        default=Currency.UZS,
        server_default=Currency.UZS.value,
    )

    # Доставка
    delivery_address: Mapped[str | None] = mapped_column(Text, nullable=True)
    delivery_city_id: Mapped[int | None] = mapped_column(
        ForeignKey("citys.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    delivery_lat: Mapped[float | None] = mapped_column(nullable=True)
    delivery_lon: Mapped[float | None] = mapped_column(nullable=True)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    buyer_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    buyer_phone_e164: Mapped[str | None] = mapped_column(String(20), nullable=True)

    # Статус
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=False, length=20),
        default=OrderStatus.NEW,
        server_default=OrderStatus.NEW.value,
        index=True,
    )
    cancelled_reason: Mapped[str | None] = mapped_column(String(256), nullable=True)

    # Атрибуция
    source_broadcast_id: Mapped[int | None] = mapped_column(
        ForeignKey("broadcasts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    source_channel_message_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    buyer: Mapped["User"] = relationship()
    seller: Mapped["SellerProfile"] = relationship()
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )
    status_logs: Mapped[list["OrderStatusLog"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="OrderStatusLog.id",
    )


class OrderItem(Base, IdMixin, TimestampMixin):
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Снапшот данных продукта (цена/название) на момент покупки — продукт может уйти в архив
    title_snapshot: Mapped[str] = mapped_column(String(200))
    unit_price_minor: Mapped[int] = mapped_column(BigInteger)
    qty: Mapped[int] = mapped_column(default=1, server_default="1")
    options_snapshot: Mapped[dict] = mapped_column(JSON, default=dict)  # {size:"M", color:"chocolate"}

    order: Mapped["Order"] = relationship(back_populates="items")


class OrderStatusLog(Base, IdMixin, TimestampMixin):
    """История переходов статусов. Append-only. Источник событий для бота."""

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    from_status: Mapped[OrderStatus | None] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=False, length=20),
        nullable=True,
    )
    to_status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status", native_enum=False, length=20),
    )
    actor_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    note: Mapped[str | None] = mapped_column(String(512), nullable=True)

    order: Mapped["Order"] = relationship(back_populates="status_logs")
