from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreateIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    body: str | None = Field(default=None, max_length=2000)


class ReviewReplyIn(BaseModel):
    reply: str = Field(min_length=1, max_length=2000)


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    seller_id: int
    author_id: int
    rating: int
    body: str | None = None
    seller_reply: str | None = None
    created_at: datetime


class ReviewListOut(BaseModel):
    items: list[ReviewOut]
    total: int
    offset: int
    limit: int
