"""Review — отзыв на продавца по конкретному заказу.

Только один отзыв на заказ (UQ order_id). `rating` ∈ [1..5]. После создания
сервис денормализует `SellerProfile.rating_avg`/`reviews_count`.
"""

from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, SmallInteger, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from models.order import Order
    from models.seller_profile import SellerProfile
    from models.user import User


class Review(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    __table_args__ = (
        UniqueConstraint("order_id", name="uq_reviews_order_id"),
        CheckConstraint("rating >= 1 AND rating <= 5", name="ck_reviews_rating_range"),
    )

    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="CASCADE"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    rating: Mapped[int] = mapped_column(SmallInteger)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    seller_reply: Mapped[str | None] = mapped_column(Text, nullable=True)

    order: Mapped["Order"] = relationship()
    seller: Mapped["SellerProfile"] = relationship()
    author: Mapped["User"] = relationship()
