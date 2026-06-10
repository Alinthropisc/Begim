from __future__ import annotations

from datetime import datetime

from pydantic import AliasPath, BaseModel, ConfigDict, Field

from models.enums import Currency, ProductStatus


class ProductPhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    sort_order: int
    width: int | None = None
    height: int | None = None


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    category_id: int | None = None
    city_id: int | None = None
    title: str
    description: str | None = None
    price_minor: int
    currency: Currency
    prep_time_hours: int | None = None
    min_order_qty: int
    tags: list = []
    attributes: dict = {}
    status: ProductStatus
    published_at: datetime | None = None
    views_count: int
    orders_count: int
    likes_count: int
    photos: list[ProductPhotoOut] = []

    # Денормализация из связанного SellerProfile (eager-load в репозитории).
    seller_name: str | None = Field(default=None, validation_alias=AliasPath("seller", "brand_name"))
    seller_avatar_url: str | None = Field(default=None, validation_alias=AliasPath("seller", "avatar_url"))
    rating: float | None = Field(default=None, validation_alias=AliasPath("seller", "rating_avg"))
    reviews_count: int | None = Field(default=None, validation_alias=AliasPath("seller", "reviews_count"))


class ProductCreateIn(BaseModel):
    title: str = Field(min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    price_minor: int = Field(ge=0, default=0)
    currency: Currency = Currency.UZS
    category_id: int | None = None
    city_id: int | None = None
    prep_time_hours: int | None = Field(default=None, ge=0)
    min_order_qty: int = Field(default=1, ge=1)
    tags: list[str] | None = None
    attributes: dict | None = None


class ProductUpdateIn(BaseModel):
    title: str | None = Field(default=None, min_length=2, max_length=160)
    description: str | None = Field(default=None, max_length=4000)
    price_minor: int | None = Field(default=None, ge=0)
    category_id: int | None = None
    city_id: int | None = None
    prep_time_hours: int | None = Field(default=None, ge=0)
    min_order_qty: int | None = Field(default=None, ge=1)
    tags: list[str] | None = None
    attributes: dict | None = None


class ProductPhotoIn(BaseModel):
    url: str = Field(min_length=4, max_length=512)
    tg_file_id: str | None = Field(default=None, max_length=256)


class ProductListOut(BaseModel):
    items: list[ProductOut]
    total: int
    offset: int
    limit: int
