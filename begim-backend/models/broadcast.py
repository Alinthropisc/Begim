"""Broadcast + BroadcastDelivery — Lazy Data Stream рассылки.

`Broadcast` — заголовок кампании (что и кому).
`BroadcastDelivery` — outbox: одна строка на каждого получателя. Воркер
arq разгребает её батчами `LIMIT 25 FOR UPDATE SKIP LOCKED`, шлёт в TG,
ставит `delivered`/`failed`/`clicked`/`converted`. Идемпотентность гарантируется
строковым статусом + блокировкой строки на время отправки.

Таблица `broadcast_deliveries` растёт быстро — впишем партиционирование по
`broadcast_id` отдельной миграцией, когда станет >50М строк (MySQL 8 RANGE).
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, DateTime, Enum as SAEnum, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import BroadcastCta, BroadcastDeliveryStatus, BroadcastStatus, BroadcastTargetType

if TYPE_CHECKING:
    from models.product import Product
    from models.seller_profile import SellerProfile
    from models.user import User


class Broadcast(Base, IdMixin, TimestampMixin):
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="CASCADE"), index=True)

    # Сегментация (Strategy-паттерн на сервисном слое):
    target_type: Mapped[BroadcastTargetType] = mapped_column(
        SAEnum(BroadcastTargetType, name="broadcast_target_type", native_enum=False, length=32),
    )
    # Параметр стратегии — id группы / города / etc. Универсально как строка.
    target_ref: Mapped[str | None] = mapped_column(String(64), nullable=True)

    # Контент
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    media: Mapped[list] = mapped_column(JSON, default=list)  # [{type:"photo", url, tg_file_id?}]

    # CTA
    cta_type: Mapped[BroadcastCta] = mapped_column(
        SAEnum(BroadcastCta, name="broadcast_cta", native_enum=False, length=20),
        default=BroadcastCta.NONE,
        server_default=BroadcastCta.NONE.value,
    )
    cta_product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )
    cta_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Состояние
    status: Mapped[BroadcastStatus] = mapped_column(
        SAEnum(BroadcastStatus, name="broadcast_status", native_enum=False, length=16),
        default=BroadcastStatus.DRAFT,
        server_default=BroadcastStatus.DRAFT.value,
        index=True,
    )
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Метрики (денормализованные счётчики — обновляются воркером)
    audience_count: Mapped[int] = mapped_column(default=0, server_default="0")
    delivered_count: Mapped[int] = mapped_column(default=0, server_default="0")
    failed_count: Mapped[int] = mapped_column(default=0, server_default="0")
    clicked_count: Mapped[int] = mapped_column(default=0, server_default="0")
    converted_count: Mapped[int] = mapped_column(default=0, server_default="0")

    seller: Mapped["SellerProfile"] = relationship()
    cta_product: Mapped["Product | None"] = relationship()


class BroadcastDelivery(Base, IdMixin, TimestampMixin):
    __table_args__ = (
        UniqueConstraint("broadcast_id", "user_id", name="uq_broadcast_deliveries_broadcast_id_user_id"),
        Index("ix_broadcast_deliveries_b_status", "broadcast_id", "status"),
    )

    broadcast_id: Mapped[int] = mapped_column(ForeignKey("broadcasts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    status: Mapped[BroadcastDeliveryStatus] = mapped_column(
        SAEnum(BroadcastDeliveryStatus, name="broadcast_delivery_status", native_enum=False, length=16),
        default=BroadcastDeliveryStatus.QUEUED,
        server_default=BroadcastDeliveryStatus.QUEUED.value,
        index=True,
    )
    tg_chat_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    tg_message_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)

    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    converted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    error_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(512), nullable=True)
    attempts: Mapped[int] = mapped_column(default=0, server_default="0")

    user: Mapped["User"] = relationship()
