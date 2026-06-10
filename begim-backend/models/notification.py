"""Notification — пользовательские уведомления (in-app + TG-DM).

`payload` — JSON с deep-link, превью, action кнопками. `read_at` ставится из
Mini App. Доставка в TG — отдельный воркер (arq), факт доставки в `delivered_at`.
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import NotificationType

if TYPE_CHECKING:
    from models.user import User


class Notification(Base, IdMixin, TimestampMixin):
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notification_type", native_enum=False, length=24),
        index=True,
    )
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    payload: Mapped[dict] = mapped_column(JSON, default=dict)

    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship()
