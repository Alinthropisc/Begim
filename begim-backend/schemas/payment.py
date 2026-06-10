from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict

from models.enums import Currency, PaymentProvider, PaymentStatus


class PaymentCreateIn(BaseModel):
    provider: PaymentProvider


class PaymentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    provider: PaymentProvider
    status: PaymentStatus
    amount_minor: int
    currency: Currency
    external_id: str | None = None
    checkout_url: str | None = None
    failure_reason: str | None = None
    created_at: datetime


class CheckoutOut(BaseModel):
    payment: PaymentOut
    checkout_url: str
    extra: dict[str, Any] = {}
