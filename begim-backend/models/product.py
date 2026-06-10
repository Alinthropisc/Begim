"""Product — товар продавца.

Цена в **тийинах** (Numeric не используем, тийины целыми): UZS не имеет дробной
части в обороте, а Numeric(12,2) на каждом джойне — лишний расход. 1 сум = 100 тийинов
оставляем «формально» (на случай USD/USDT в будущем) — конвертация в копейки в сервисе.

При публикации (status → PUBLISHED) воркер шлёт пост в глобальный канал; результат
сохраняем в `ChannelPost` (FK Product.id, message_id) — чтобы потом редактировать/удалять.
"""

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, BigInteger, DateTime, Enum as SAEnum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from models.base import Base, IdMixin, SoftDeleteMixin, TimestampMixin
from models.enums import Currency, ProductStatus

if TYPE_CHECKING:
    from models.category import Category
    from models.product_photo import ProductPhoto
    from models.seller_profile import SellerProfile


class Product(Base, IdMixin, TimestampMixin, SoftDeleteMixin):
    __table_args__ = (
        # FULLTEXT (InnoDB, MySQL 8) — поиск title+description с поддержкой кириллицы/латиницы.
        Index("ftx_products_title_desc", "title", "description", mysql_prefix="FULLTEXT"),
        Index("ix_products_city_status_pub", "city_id", "status", "published_at"),
        {"mysql_engine": "InnoDB", "mysql_charset": "utf8mb4", "mysql_collate": "utf8mb4_unicode_ci"},
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("seller_profiles.id", ondelete="CASCADE"),
        index=True,
    )
    category_id: Mapped[int | None] = mapped_column(
        ForeignKey("categorys.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    city_id: Mapped[int | None] = mapped_column(
        ForeignKey("citys.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Цена в наименьшей единице (тийины для UZS). 0 = «по запросу».
    price_minor: Mapped[int] = mapped_column(BigInteger, default=0, server_default="0")
    currency: Mapped[Currency] = mapped_column(
        SAEnum(Currency, name="currency", native_enum=False, length=8),
        default=Currency.UZS,
        server_default=Currency.UZS.value,
    )

    # Логистика
    prep_time_hours: Mapped[int | None] = mapped_column(nullable=True)  # «нужно за сутки»
    min_order_qty: Mapped[int] = mapped_column(default=1, server_default="1")

    # Структурированные поля (JSONB — гибче, чем 10 колонок)
    # tags: ["vegan","gluten-free","custom"], allergens: ["nuts"], options: [{name:"size", values:[...]}]
    tags: Mapped[list] = mapped_column(JSON, default=list)
    attributes: Mapped[dict] = mapped_column(JSON, default=dict)

    # Статус
    status: Mapped[ProductStatus] = mapped_column(
        SAEnum(ProductStatus, name="product_status", native_enum=False, length=20),
        default=ProductStatus.DRAFT,
        server_default=ProductStatus.DRAFT.value,
        index=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    # Метрики (денормализованы)
    views_count: Mapped[int] = mapped_column(default=0, server_default="0")
    orders_count: Mapped[int] = mapped_column(default=0, server_default="0")
    likes_count: Mapped[int] = mapped_column(default=0, server_default="0")

    # Relationships
    seller: Mapped["SellerProfile"] = relationship()
    category: Mapped["Category | None"] = relationship()
    photos: Mapped[list["ProductPhoto"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        order_by="ProductPhoto.sort_order",
    )
