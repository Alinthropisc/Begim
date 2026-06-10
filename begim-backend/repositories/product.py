"""ProductRepository + Specification-паттерн для листинга.

Зачем Specification: каждый фильтр (город, категория, поиск, ценовой диапазон,
рейтинг) — отдельный объект со своим `.apply(stmt)`. Композиция через `&`.
Добавить новый фильтр = новый класс, репозиторий не трогаем.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from sqlalchemy import Select, desc, func, select, text
from sqlalchemy.orm import selectinload

from models.enums import ProductStatus
from models.product import Product
from repositories.base_repository import BaseRepository


# ----- Specifications -----

class ProductSpec:
    """Базовый интерфейс спецификации."""

    def apply(self, stmt: Select) -> Select:  # noqa: D401
        return stmt

    def __and__(self, other: "ProductSpec") -> "ProductSpec":
        return _AndSpec(self, other)


@dataclass(slots=True)
class _AndSpec(ProductSpec):
    a: ProductSpec
    b: ProductSpec

    def apply(self, stmt: Select) -> Select:
        return self.b.apply(self.a.apply(stmt))


@dataclass(slots=True)
class PublishedOnly(ProductSpec):
    def apply(self, stmt: Select) -> Select:
        return stmt.where(Product.status == ProductStatus.PUBLISHED, Product.is_deleted.is_(False))


@dataclass(slots=True)
class InCity(ProductSpec):
    city_id: int

    def apply(self, stmt: Select) -> Select:
        return stmt.where(Product.city_id == self.city_id)


@dataclass(slots=True)
class InCategory(ProductSpec):
    category_id: int

    def apply(self, stmt: Select) -> Select:
        return stmt.where(Product.category_id == self.category_id)


@dataclass(slots=True)
class BySeller(ProductSpec):
    seller_id: int

    def apply(self, stmt: Select) -> Select:
        return stmt.where(Product.seller_id == self.seller_id)


@dataclass(slots=True)
class PriceRange(ProductSpec):
    min_minor: int | None = None
    max_minor: int | None = None

    def apply(self, stmt: Select) -> Select:
        if self.min_minor is not None:
            stmt = stmt.where(Product.price_minor >= self.min_minor)
        if self.max_minor is not None and self.max_minor > 0:
            stmt = stmt.where(Product.price_minor <= self.max_minor)
        return stmt


@dataclass(slots=True)
class FullTextSearch(ProductSpec):
    """MySQL FULLTEXT MATCH(...) AGAINST (...). Для коротких запросов — IN BOOLEAN MODE."""

    query: str

    def apply(self, stmt: Select) -> Select:
        q = self.query.strip()
        if not q:
            return stmt
        # IN BOOLEAN MODE даёт частичные совпадения и не требует ft_min_word_len.
        # Префикс '+' к каждому слову — AND-семантика; '*' в конце — частичный матч.
        terms = " ".join(f"+{t}*" for t in q.split() if len(t) >= 2)
        if not terms:
            # запасной путь — обычный LIKE по title
            return stmt.where(Product.title.ilike(f"%{q}%"))
        return stmt.where(
            text("MATCH(products.title, products.description) AGAINST (:ftq IN BOOLEAN MODE)")
            .bindparams(ftq=terms)
        )


# ----- Sort strategies -----

SORT_STRATEGIES = {
    "recent": lambda s: s.order_by(desc(Product.published_at), desc(Product.id)),
    "popular": lambda s: s.order_by(desc(Product.orders_count), desc(Product.id)),
    "price_asc": lambda s: s.order_by(Product.price_minor.asc(), desc(Product.id)),
    "price_desc": lambda s: s.order_by(Product.price_minor.desc(), desc(Product.id)),
}


# ----- Repository -----

class ProductRepository(BaseRepository[Product]):
    model = Product

    async def get_with_photos(self, product_id: int) -> Product | None:
        stmt = (
            select(Product)
            .where(Product.id == product_id, Product.is_deleted.is_(False))
            .options(selectinload(Product.photos), selectinload(Product.seller))
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_spec(
        self,
        spec: ProductSpec,
        *,
        sort: str = "recent",
        offset: int = 0,
        limit: int = 24,
    ) -> tuple[Sequence[Product], int]:
        """Возвращает (items, total). Total — отдельный COUNT(*) с теми же фильтрами."""
        base = select(Product).options(
            selectinload(Product.photos),
            selectinload(Product.seller),  # для seller_name/rating в ProductOut
        )
        base = spec.apply(base)

        sort_fn = SORT_STRATEGIES.get(sort, SORT_STRATEGIES["recent"])
        stmt = sort_fn(base).offset(offset).limit(limit)
        items = (await self.session.execute(stmt)).scalars().unique().all()

        count_stmt = spec.apply(select(func.count(Product.id)))
        total = int((await self.session.execute(count_stmt)).scalar_one())
        return items, total
