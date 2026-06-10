"""Follow — подписка покупателя на продавца.

Используется для ленты и broadcast-таргета `FOLLOWERS`. Уникальный (follower, seller).
"""

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from models.base import Base, IdMixin, TimestampMixin


class Follow(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("follower_id", "seller_id", name="uq_follows_follower_id_seller_id"),)
    follower_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="CASCADE"), index=True)
