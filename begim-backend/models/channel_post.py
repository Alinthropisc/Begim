"""ChannelPost — связь продукта с его публикацией в глобальном канале Begim.

Храним, чтобы:
- редактировать пост при изменении товара (новое фото, цена, статус),
- удалять пост при архивации товара,
- отслеживать клики/просмотры (channel_views денормализованы из tg getChat).
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from models.product import Product


class ChannelPost(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("channel_id", "message_id", name="uq_channel_posts_channel_id_message_id"),)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), index=True)
    channel_id: Mapped[int] = mapped_column(BigInteger)
    message_id: Mapped[int] = mapped_column(BigInteger)
    posted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    last_edited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    views_cached: Mapped[int] = mapped_column(default=0, server_default="0")

    product: Mapped["Product"] = relationship()
