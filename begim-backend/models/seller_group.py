"""SellerGroup + SellerGroupMember — клуб клиентов продавца.

Это CRM-сущность: продавец сам управляет аудиторией, добавляет/удаляет, ставит
теги (через `tags` JSON в SellerGroupMember), отправляет broadcast'ы группе.

Опт-ин строго обязателен (`opt_in_marketing`). Без него `BroadcastService.dispatch`
бросает исключение, даже если member физически в группе.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, Enum as SAEnum, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin
from models.enums import GroupMemberSource, SellerGroupPrivacy

if TYPE_CHECKING:
    from models.seller_profile import SellerProfile
    from models.user import User


class SellerGroup(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    privacy: Mapped[SellerGroupPrivacy] = mapped_column(
        SAEnum(SellerGroupPrivacy, name="seller_group_privacy", native_enum=False, length=20),
        default=SellerGroupPrivacy.INVITE_ONLY,
        server_default=SellerGroupPrivacy.INVITE_ONLY.value,
    )
    # Уникальный slug для deep-link приглашений: t.me/BegimBot?start=join_<slug>
    invite_slug: Mapped[str] = mapped_column(String(48), unique=True, index=True)
    members_count: Mapped[int] = mapped_column(default=0, server_default="0")

    seller: Mapped["SellerProfile"] = relationship()


class SellerGroupMember(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("group_id", "user_id", name="uq_seller_group_members_group_id_user_id"),)

    group_id: Mapped[int] = mapped_column(ForeignKey("seller_groups.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    source: Mapped[GroupMemberSource] = mapped_column(
        SAEnum(GroupMemberSource, name="group_member_source", native_enum=False, length=24),
    )

    # Согласие на рассылки. Без него — никаких broadcast'ов на этого юзера.
    opt_in_marketing: Mapped[bool] = mapped_column(default=False, server_default="0", index=True)
    opt_in_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Каналы доставки: {"telegram_dm": true, "in_app_push": true}
    channels: Mapped[dict] = mapped_column(JSON, default=dict)
    # Теги, которые ставит продавец вручную ("VIP", "Cake-fan")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    muted_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship()
