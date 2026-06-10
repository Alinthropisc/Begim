"""Public listing + seller CRUD products."""
from __future__ import annotations

from litestar import Controller, delete, get, patch, post
from litestar.di import Provide
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)
from litestar.params import Parameter

from app.config import settings
from app.lifecycle import get_arq
from models.user import User
from schemas.product import (
    ProductCreateIn,
    ProductListOut,
    ProductOut,
    ProductPhotoIn,
    ProductPhotoOut,
    ProductUpdateIn,
)
from services.products import (
    CreateProductInput,
    ListProductsInput,
    ProductForbidden,
    ProductNotFound,
    ProductNotPublishable,
    ProductService,
    UpdateProductInput,
)


async def _enqueue_publish(product_id: int) -> None:
    """Через arq pool — кладём задачу publish_to_channel(product_id)."""
    arq = get_arq()
    await arq.enqueue_job("publish_to_channel", product_id)


def _provide_product_service() -> ProductService:
    return ProductService(enqueue_publish=_enqueue_publish)


class ProductController(Controller):
    path = settings.api_prefix + "/products"
    tags = ["products"]
    dependencies = {"product_service": Provide(_provide_product_service, sync_to_thread=False)}

    @get("/")
    async def list_products(
        self,
        product_service: ProductService,
        city: int | None = Parameter(query="city", default=None),
        category: int | None = Parameter(query="category", default=None),
        seller: int | None = Parameter(query="seller", default=None),
        q: str | None = Parameter(query="q", default=None),
        price_min: int | None = Parameter(query="price_min", default=None),
        price_max: int | None = Parameter(query="price_max", default=None),
        sort: str = Parameter(query="sort", default="recent"),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=24),
    ) -> ProductListOut:
        items, total = await product_service.list_public(
            ListProductsInput(
                city_id=city, category_id=category, seller_id=seller,
                q=q, price_min=price_min, price_max=price_max,
                sort=sort, offset=offset, limit=limit,
            )
        )
        return ProductListOut(
            items=[ProductOut.model_validate(p) for p in items],
            total=total,
            offset=offset,
            limit=limit,
        )

    @get("/{product_id:int}")
    async def get_product(self, product_id: int, product_service: ProductService) -> ProductOut:
        try:
            product = await product_service.get_public(product_id)
        except ProductNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return ProductOut.model_validate(product)

    @post("/", status_code=201)
    async def create_draft(
        self,
        data: ProductCreateIn,
        current_user: User,
        product_service: ProductService,
    ) -> ProductOut:
        try:
            product = await product_service.create_draft(
                user_id=current_user.id,
                data=CreateProductInput(**data.model_dump()),
            )
        except ProductForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return ProductOut.model_validate(product)

    @patch("/{product_id:int}")
    async def update_product(
        self,
        product_id: int,
        data: ProductUpdateIn,
        current_user: User,
        product_service: ProductService,
    ) -> ProductOut:
        try:
            product = await product_service.update(
                user_id=current_user.id,
                product_id=product_id,
                data=UpdateProductInput(**data.model_dump(exclude_unset=True)),
            )
        except ProductForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except ProductNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return ProductOut.model_validate(product)

    @post("/{product_id:int}/publish")
    async def publish_product(
        self,
        product_id: int,
        current_user: User,
        product_service: ProductService,
    ) -> ProductOut:
        try:
            product = await product_service.publish(current_user.id, product_id)
        except ProductForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except ProductNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except ProductNotPublishable as e:
            raise ClientException(detail=str(e)) from e
        return ProductOut.model_validate(product)

    @post("/{product_id:int}/archive")
    async def archive_product(
        self,
        product_id: int,
        current_user: User,
        product_service: ProductService,
    ) -> ProductOut:
        try:
            product = await product_service.archive(current_user.id, product_id)
        except ProductForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except ProductNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return ProductOut.model_validate(product)

    @post("/{product_id:int}/photos", status_code=201)
    async def add_photo(
        self,
        product_id: int,
        data: ProductPhotoIn,
        current_user: User,
        product_service: ProductService,
    ) -> ProductPhotoOut:
        try:
            photo = await product_service.add_photo(
                user_id=current_user.id,
                product_id=product_id,
                url=data.url,
                tg_file_id=data.tg_file_id,
            )
        except ProductForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except ProductNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return ProductPhotoOut.model_validate(photo)
