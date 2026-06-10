"""SellerContact — импортированный контакт продавца.

Privacy-first: телефон в открытом виде НЕ храним. На входе хэшируем
`sha256(salt + e164_phone)` → пишем `phone_hash` (тот же алгоритм, что для
`User.phone_hash`). При совпадении хэшей — это тот же человек.

`matched_user_id` ставится сервисом `ContactsService` при совпадении хэшей.
Дальше: продавец жмёт «пригласить в клуб» → бот шлёт matched-юзеру личное
soft-permission приглашение. Только после явного «Да» создаётся
`SellerGroupMember(opt_in_marketing=true)`.
"""
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import ContactImportStatus

if TYPE_CHECKING:
    from models.seller_profile import SellerProfile
    from models.user import User


class SellerContact(Base, IdMixin, TimestampMixin):
    __table_args__ = (
        UniqueConstraint("seller_id", "phone_hash", name="uq_seller_contacts_seller_id_phone_hash"),
    )

    seller_id: Mapped[int] = mapped_column(ForeignKey("seller_profiles.id", ondelete="CASCADE"), index=True)
    phone_hash: Mapped[str] = mapped_column(String(64), index=True)
    display_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    # Заполняется, если хэш совпал с user'ом в Begim.
    matched_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status: Mapped[ContactImportStatus] = mapped_column(
        SAEnum(ContactImportStatus, name="contact_import_status", native_enum=False, length=16),
        default=ContactImportStatus.PENDING,
        server_default=ContactImportStatus.PENDING.value,
    )
    last_invited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    invite_token: Mapped[str | None] = mapped_column(String(48), nullable=True, index=True)

    seller: Mapped["SellerProfile"] = relationship()
    matched_user: Mapped["User | None"] = relationship()
