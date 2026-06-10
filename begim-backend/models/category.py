"""Category — двухуровневое дерево категорий (parent_id).

Достаточно для маркетплейса в одной нише (домашняя выпечка): «Торты» → «Бенто-торты»,
«Национальные сладости» → «Чак-чак». Без полноценного nested-set — проще и быстрее.
"""

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, TimestampMixin

if TYPE_CHECKING:
    pass


class Category(Base, IdMixin, TimestampMixin):
    __table_args__ = (UniqueConstraint("slug", name="uq_categorys_slug"),)

    slug: Mapped[str] = mapped_column(String(64), index=True)
    name_uz: Mapped[str] = mapped_column(String(128))
    name_ru: Mapped[str] = mapped_column(String(128))
    name_en: Mapped[str] = mapped_column(String(128))
    icon: Mapped[str | None] = mapped_column(String(64), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("categorys.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(default=True, server_default="1", index=True)
    sort_order: Mapped[int] = mapped_column(default=0, server_default="0")

    parent: Mapped["Category | None"] = relationship(remote_side="Category.id", back_populates="children")
    children: Mapped[list["Category"]] = relationship(back_populates="parent")

    def localized_name(self, locale: str) -> str:
        return {"uz": self.name_uz, "ru": self.name_ru, "en": self.name_en}.get(locale, self.name_uz)
