"""ProductPhoto — медиа товара (1-к-многим).

Храним url и Telegram `file_id` (после первой загрузки в TG — переиспользуем без
повторного аплоада, это в разы быстрее на больших фото).
"""
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from models.product import Product


class ProductPhoto(Base, IdMixin, TimestampMixin):
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="CASCADE"),
        index=True,
    )
    url: Mapped[str] = mapped_column(String(512))
    tg_file_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")
    width: Mapped[int | None] = mapped_column(nullable=True)
    height: Mapped[int | None] = mapped_column(nullable=True)

    product: Mapped["Product"] = relationship(back_populates="photos")
