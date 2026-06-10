"""ProductService — CRUD продавца + публичный листинг + publish-флоу.

Публикация:
1. Проверяем что у продукта есть хотя бы 1 фото и непустой title.
2. Меняем статус на PUBLISHED, ставим `published_at = now()`.
3. Энкьюим arq-таску `publish_to_channel(product_id)` — она сделает реальный
   пост в @begim и сохранит `ChannelPost`.

Архивация:
1. Меняем статус на ARCHIVED.
2. Энкьюим `unpublish_from_channel(product_id)` — удалит пост (если был).

Архивация / re-publish — идемпотентны на уровне таски (она проверяет наличие
ChannelPost перед действием).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone, UTC
from typing import Any
from collections.abc import Sequence

from loguru import logger

from app.config import settings
from models.enums import Currency, ProductStatus
from models.product import Product
from models.product_photo import ProductPhoto
from repositories import UnitOfWork
from repositories.product import (
    BySeller,
    FullTextSearch,
    InCategory,
    InCity,
    PriceRange,
    ProductSpec,
    PublishedOnly,
)


# ----- Exceptions -----


class ProductError(Exception):
    pass


class ProductNotFound(ProductError):
    pass


class ProductForbidden(ProductError):
    pass


class ProductNotPublishable(ProductError):
    pass


# ----- DTO -----


@dataclass(slots=True)
class CreateProductInput:
    title: str
    description: str | None = None
    price_minor: int = 0
    currency: Currency = Currency.UZS
    category_id: int | None = None
    city_id: int | None = None
    prep_time_hours: int | None = None
    min_order_qty: int = 1
    tags: list[str] | None = None
    attributes: dict[str, Any] | None = None


@dataclass(slots=True)
class UpdateProductInput:
    title: str | None = None
    description: str | None = None
    price_minor: int | None = None
    category_id: int | None = None
    city_id: int | None = None
    prep_time_hours: int | None = None
    min_order_qty: int | None = None
    tags: list[str] | None = None
    attributes: dict[str, Any] | None = None


@dataclass(slots=True)
class ListProductsInput:
    city_id: int | None = None
    category_id: int | None = None
    q: str | None = None
    price_min: int | None = None
    price_max: int | None = None
    seller_id: int | None = None
    sort: str = "recent"
    offset: int = 0
    limit: int = 24
    only_published: bool = True


# ----- Service -----


class ProductService:
    def __init__(self, uow_factory=UnitOfWork, enqueue_publish=None) -> None:
        self._uow_factory = uow_factory
        # Внедрение: callable(product_id) → enqueue arq task.
        # Тесты мокают это, в lifespan подставляется реальный arq.
        self._enqueue_publish = enqueue_publish

    # ----- listing -----

    async def list_public(self, q: ListProductsInput) -> tuple[Sequence[Product], int]:
        spec: ProductSpec = PublishedOnly() if q.only_published else _NoOp()
        if q.city_id:
            spec = spec & InCity(q.city_id)
        if q.category_id:
            spec = spec & InCategory(q.category_id)
        if q.seller_id:
            spec = spec & BySeller(q.seller_id)
        if q.price_min is not None or q.price_max is not None:
            spec = spec & PriceRange(min_minor=q.price_min, max_minor=q.price_max)
        if q.q:
            spec = spec & FullTextSearch(q.q)

        # Ограничения пагинации
        limit = max(1, min(q.limit, 60))
        offset = max(0, q.offset)

        async with self._uow_factory() as uow:
            return await uow.products.list_by_spec(spec, sort=q.sort, offset=offset, limit=limit)

    async def get_public(self, product_id: int) -> Product:
        async with self._uow_factory() as uow:
            product = await uow.products.get_with_photos(product_id)
            if product is None or product.status != ProductStatus.PUBLISHED:
                raise ProductNotFound("product not found or not published")
            # инкрементим счётчик просмотров без блокировок
            product.views_count = (product.views_count or 0) + 1
            return product

    # ----- seller-owned -----

    async def create_draft(self, user_id: int, data: CreateProductInput) -> Product:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise ProductForbidden("user is not a seller")

            product = Product(
                seller_id=seller.id,
                category_id=data.category_id,
                city_id=data.city_id or seller.city_id,
                title=data.title.strip(),
                description=data.description,
                price_minor=max(0, data.price_minor),
                currency=data.currency,
                prep_time_hours=data.prep_time_hours,
                min_order_qty=max(1, data.min_order_qty),
                tags=data.tags or [],
                attributes=data.attributes or {},
                status=ProductStatus.DRAFT,
            )
            uow.session.add(product)
            await uow.flush()
            return product

    async def update(self, user_id: int, product_id: int, data: UpdateProductInput) -> Product:
        async with self._uow_factory() as uow:
            product = await self._load_owned(uow, product_id, user_id)
            for field, value in data.__dict__.items():
                if value is not None and hasattr(product, field):
                    setattr(product, field, value)
            await uow.flush()
            return product

    async def publish(self, user_id: int, product_id: int) -> Product:
        async with self._uow_factory() as uow:
            product = await self._load_owned(uow, product_id, user_id)
            self._assert_publishable(product)

            product.status = ProductStatus.PUBLISHED
            product.published_at = datetime.now(UTC)
            await uow.flush()
            product_id_final = product.id

        # Энкьюим после успешного коммита — иначе таска может побежать на «несуществующем» товаре.
        if self._enqueue_publish is not None:
            try:
                await self._enqueue_publish(product_id_final)
            except Exception as e:
                logger.warning("enqueue publish failed for product {}: {}", product_id_final, e)
        return product

    async def archive(self, user_id: int, product_id: int) -> Product:
        async with self._uow_factory() as uow:
            product = await self._load_owned(uow, product_id, user_id)
            product.status = ProductStatus.ARCHIVED
            await uow.flush()
            return product

    async def add_photo(self, user_id: int, product_id: int, url: str, *, tg_file_id: str | None = None) -> ProductPhoto:
        async with self._uow_factory() as uow:
            product = await self._load_owned(uow, product_id, user_id)
            order = max((p.sort_order for p in product.photos), default=-1) + 1
            photo = ProductPhoto(product_id=product.id, url=url, tg_file_id=tg_file_id, sort_order=order)
            uow.session.add(photo)
            await uow.flush()
            return photo

    # ----- helpers -----

    async def _load_owned(self, uow: UnitOfWork, product_id: int, user_id: int) -> Product:
        """Загрузить продукт + проверить, что текущий user — его продавец."""
        seller = await uow.sellers.get_by_user_id(user_id)
        if seller is None:
            raise ProductForbidden("user is not a seller")
        product = await uow.products.get_with_photos(product_id)
        if product is None:
            raise ProductNotFound("product not found")
        if product.seller_id != seller.id:
            raise ProductForbidden("not your product")
        return product

    def _assert_publishable(self, product: Product) -> None:
        problems = []
        if not product.title or not product.title.strip():
            problems.append("title")
        if not product.photos:
            problems.append("photos")
        if problems:
            raise ProductNotPublishable(f"missing required: {', '.join(problems)}")


class _NoOp(ProductSpec):
    def apply(self, stmt):
        return stmt
