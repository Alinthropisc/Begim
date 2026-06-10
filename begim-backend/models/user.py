"""User — основная сущность аккаунта.

Один человек = один User. Telegram — единственный способ аутентификации:
`tg_id` уникален и обязателен; всё, что приходит из initData (имя, username,
photo_url, language_code), кладётся сюда. Роль (`customer`/`seller`/`admin`)
живёт здесь же — продавцы это users с расширенным `SellerProfile` через 1-к-1.
Телефон храним как соль+SHA-256 для матчинга по импортированным контактам;
сам телефон в БД не пишем — это снимает целый класс юридических вопросов.
"""

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin
from models.enums import Locale, UserRole

if TYPE_CHECKING:
    from models.city import City
    from models.seller_profile import SellerProfile


class User(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    # Telegram identity
    tg_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    tg_username: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    tg_first_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    tg_last_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    tg_photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    tg_language_code: Mapped[str | None] = mapped_column(String(8), nullable=True)
    is_tg_premium: Mapped[bool] = mapped_column(default=False, server_default="0")

    # Authorization
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="user_role", native_enum=False, length=20),
        default=UserRole.CUSTOMER,
        server_default=UserRole.CUSTOMER.value,
        index=True,
    )

    # Profile
    display_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    locale: Mapped[Locale] = mapped_column(
        SAEnum(Locale, name="locale", native_enum=False, length=4),
        default=Locale.UZ,
        server_default=Locale.UZ.value,
    )

    # Contact (privacy-preserving)
    phone_hash: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)

    # City
    city_id: Mapped[int | None] = mapped_column(ForeignKey("citys.id", ondelete="SET NULL"), nullable=True, index=True)

    # State
    is_blocked: Mapped[bool] = mapped_column(default=False, server_default="0")
    # Согласие на маркетинговые рассылки от продавцов (глобальный switch).
    marketing_opt_in: Mapped[bool] = mapped_column(default=False, server_default="0")

    # Relationships
    city: Mapped["City | None"] = relationship(back_populates="users")
    seller_profile: Mapped["SellerProfile | None"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )

    @property
    def is_seller(self) -> bool:
        return self.role in (UserRole.SELLER, UserRole.ADMIN)

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN
