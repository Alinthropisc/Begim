"""City — справочник городов.

Старт: только Коканд активен. Новые города (Наманган, Андижан, ...) добавляются
сидером или из бэк-офиса без релиза кода. Все основные сущности (пользователь,
профиль продавца, продукт, заказ) знают свой `city_id` → фильтрация ленты по
городу = простой WHERE без джойнов.
"""

from typing import TYPE_CHECKING

from sqlalchemy import Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    from models.user import User


class City(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("slug", name="uq_citys_slug"),)

    slug: Mapped[str] = mapped_column(String(64), index=True)  # 'kokand', 'namangan'
    name_uz: Mapped[str] = mapped_column(String(128))
    name_ru: Mapped[str] = mapped_column(String(128))
    name_en: Mapped[str] = mapped_column(String(128))
    region: Mapped[str | None] = mapped_column(String(128), nullable=True)  # 'Fergana Region'
    lat: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    lon: Mapped[float | None] = mapped_column(Numeric(9, 6), nullable=True)
    is_active: Mapped[bool] = mapped_column(default=False, server_default="0", index=True)
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    users: Mapped[list["User"]] = relationship(back_populates="city")

    def localized_name(self, locale: str) -> str:
        return {"uz": self.name_uz, "ru": self.name_ru, "en": self.name_en}.get(locale, self.name_uz)
