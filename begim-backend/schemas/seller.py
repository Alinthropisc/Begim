from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

from models.enums import SellerVerification


class SellerCreateIn(BaseModel):
    brand_name: str = Field(min_length=2, max_length=128)
    bio: str | None = Field(default=None, max_length=2000)
    contact_phone_e164: str | None = Field(default=None, max_length=20)
    contact_tg_username: str | None = Field(default=None, max_length=64)
    city_id: int | None = None


class SellerUpdateIn(BaseModel):
    brand_name: str | None = Field(default=None, min_length=2, max_length=128)
    bio: str | None = Field(default=None, max_length=2000)
    avatar_url: str | None = None
    cover_url: str | None = None
    contact_phone_e164: str | None = Field(default=None, max_length=20)
    contact_tg_username: str | None = Field(default=None, max_length=64)
    delivery_info: str | None = Field(default=None, max_length=2000)
    city_id: int | None = None
    address_hint: str | None = Field(default=None, max_length=256)


class SellerPublicOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    brand_name: str
    bio: str | None = None
    avatar_url: str | None = None
    cover_url: str | None = None
    contact_tg_username: str | None = None
    city_id: int | None = None
    verification: SellerVerification
    rating_avg: float
    reviews_count: int
    products_count: int
    followers_count: int
    orders_completed: int


class SellerOwnerOut(SellerPublicOut):
    """То же + контакты (которые публично не отдаём всем)."""

    contact_phone_e164: str | None = None
    delivery_info: str | None = None
    address_hint: str | None = None
