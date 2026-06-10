"""Story + StoryView.

24-часовые сторис от верифицированных продавцов. `expires_at` ставится сервисом
(now + settings.story_ttl_hours). Зачистка устаревших — arq-таска (soft-archive,
саму запись не удаляем — для аналитики и архива продавца).

Просмотр пишется один раз на пару (story_id, viewer_id) — уникальный индекс
гарантирует идемпотентность; UPSERT в сервисе.
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from models.product import Product
    from models.seller_profile import SellerProfile
    from models.user import User


class Story(Base, IdMixin, TimestampMixin):
    seller_id: Mapped[int] = mapped_column(
        ForeignKey("seller_profiles.id", ondelete="CASCADE"),
        index=True,
    )
    media_url: Mapped[str] = mapped_column(String(512))
    media_type: Mapped[str] = mapped_column(String(16), default="image")  # 'image' | 'video'
    tg_file_id: Mapped[str | None] = mapped_column(String(256), nullable=True)
    caption: Mapped[str | None] = mapped_column(String(512), nullable=True)
    # Опциональная ссылка на товар — тап по сторис ведёт на карточку.
    product_id: Mapped[int | None] = mapped_column(
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    is_archived: Mapped[bool] = mapped_column(default=False, server_default="0", index=True)
    views_count: Mapped[int] = mapped_column(default=0, server_default="0")

    seller: Mapped["SellerProfile"] = relationship()
    product: Mapped["Product | None"] = relationship()


class StoryView(Base, IdMixin, TimestampMixin):
    __table_args__ = (
        UniqueConstraint("story_id", "viewer_id", name="uq_story_views_story_id_viewer_id"),
    )

    story_id: Mapped[int] = mapped_column(ForeignKey("storys.id", ondelete="CASCADE"), index=True)
    viewer_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    story: Mapped["Story"] = relationship()
    viewer: Mapped["User"] = relationship()
