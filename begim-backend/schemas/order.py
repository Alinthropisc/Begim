from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from models.enums import Currency, OrderStatus


class OrderItemIn(BaseModel):
    product_id: int = Field(gt=0)
    qty: int = Field(default=1, ge=1)
    options: dict[str, Any] | None = None


class OrderCreateIn(BaseModel):
    items: list[OrderItemIn] = Field(min_length=1)
    delivery_address: str | None = Field(default=None, max_length=2000)
    delivery_city_id: int | None = None
    delivery_lat: float | None = None
    delivery_lon: float | None = None
    scheduled_for: datetime | None = None
    buyer_comment: str | None = Field(default=None, max_length=2000)
    buyer_phone_e164: str | None = Field(default=None, max_length=20)
    delivery_fee_minor: int = Field(default=0, ge=0)
    source_broadcast_id: int | None = None
    source_channel_message_id: int | None = None
    idempotency_key: str | None = Field(default=None, max_length=64)


class OrderTransitionIn(BaseModel):
    to_status: OrderStatus
    note: str | None = Field(default=None, max_length=512)


class OrderCancelIn(BaseModel):
    reason: str | None = Field(default=None, max_length=256)


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None = None
    title_snapshot: str
    unit_price_minor: int
    qty: int
    options_snapshot: dict = {}


class OrderStatusLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    from_status: OrderStatus | None = None
    to_status: OrderStatus
    actor_user_id: int | None = None
    note: str | None = None
    created_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    buyer_id: int
    seller_id: int
    status: OrderStatus
    currency: Currency
    subtotal_minor: int
    delivery_fee_minor: int
    discount_minor: int
    total_minor: int
    delivery_address: str | None = None
    delivery_city_id: int | None = None
    scheduled_for: datetime | None = None
    buyer_comment: str | None = None
    buyer_phone_e164: str | None = None
    cancelled_reason: str | None = None
    source_broadcast_id: int | None = None
    source_channel_message_id: int | None = None
    created_at: datetime
    items: list[OrderItemOut] = []
    status_logs: list[OrderStatusLogOut] = []


class OrderListOut(BaseModel):
    items: list[OrderOut]
    total: int
    offset: int
    limit: int
