"""SellerProfile — расширение User для тех, кто продаёт.

Отделено от User, чтобы не раздувать «горячую» таблицу и не платить за лишние
колонки при каждом lookup'е покупателя. Создаётся, когда пользователь нажимает
«стать продавцом» в Mini App и проходит модерацию.
"""
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SAEnum, ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin
from models.enums import SellerVerification

if TYPE_CHECKING:
    from models.user import User


class SellerProfile(Base, IdMixin, TimestampMixin):
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
    )

    # Витрина
    brand_name: Mapped[str] = mapped_column(String(128), index=True)
    slug: Mapped[str] = mapped_column(String(64), unique=True, index=True)  # для красивых ссылок
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    cover_url: Mapped[str | None] = mapped_column(String(512), nullable=True)

    # Контакты (для покупателей)
    contact_phone_e164: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contact_tg_username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    delivery_info: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Гео
    city_id: Mapped[int | None] = mapped_column(ForeignKey("citys.id", ondelete="SET NULL"), nullable=True, index=True)
    address_hint: Mapped[str | None] = mapped_column(String(256), nullable=True)
    lat: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    lon: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)

    # Модерация и доверие
    verification: Mapped[SellerVerification] = mapped_column(
        SAEnum(SellerVerification, name="seller_verification", native_enum=False, length=20),
        default=SellerVerification.UNVERIFIED,
        server_default=SellerVerification.UNVERIFIED.value,
        index=True,
    )

    # Метрики — денормализованы для скорости. Пересчёт в фоне.
    rating_avg: Mapped[float] = mapped_column(Numeric(3, 2), default=0, server_default="0")
    reviews_count: Mapped[int] = mapped_column(default=0, server_default="0")
    products_count: Mapped[int] = mapped_column(default=0, server_default="0")
    followers_count: Mapped[int] = mapped_column(default=0, server_default="0")
    orders_completed: Mapped[int] = mapped_column(default=0, server_default="0")

    # Relationships
    user: Mapped["User"] = relationship(back_populates="seller_profile")
