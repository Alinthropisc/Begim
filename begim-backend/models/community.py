"""CommunityPost + PostLike + PostComment.

Лента для пользователей и продавцов: короткие посты с фото/описанием. Если
пост от продавца и привязан к товару — рендерим кнопку «Открыть товар».
Лента ранжируется в сервисе: свежесть × city_match × follower_signal.
"""

from typing import TYPE_CHECKING

from sqlalchemy import JSON, ForeignKey, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin

if TYPE_CHECKING:
    from models.product import Product
    from models.user import User


class CommunityPost(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    city_id: Mapped[int | None] = mapped_column(ForeignKey("citys.id", ondelete="SET NULL"), nullable=True, index=True)
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    body: Mapped[str] = mapped_column(Text)
    photos: Mapped[list] = mapped_column(JSON, default=list)  # ["url1", "url2"]
    tags: Mapped[list] = mapped_column(JSON, default=list)

    likes_count: Mapped[int] = mapped_column(default=0, server_default="0")
    comments_count: Mapped[int] = mapped_column(default=0, server_default="0")

    author: Mapped["User"] = relationship()
    product: Mapped["Product | None"] = relationship()


class PostLike(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("post_id", "user_id", name="uq_post_likes_post_id_user_id"),)
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)


class PostComment(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    post_id: Mapped[int] = mapped_column(ForeignKey("community_posts.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_comment_id: Mapped[int | None] = mapped_column(
        ForeignKey("post_comments.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    body: Mapped[str] = mapped_column(Text)
