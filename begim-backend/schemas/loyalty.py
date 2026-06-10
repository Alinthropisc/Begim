from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.enums import (
    BroadcastCta,
    BroadcastStatus,
    BroadcastTargetType,
    ContactImportStatus,
    SellerGroupPrivacy,
)


# ----- Groups -----

class GroupCreateIn(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    description: str | None = Field(default=None, max_length=2000)
    privacy: SellerGroupPrivacy = SellerGroupPrivacy.INVITE_ONLY


class GroupOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    name: str
    description: str | None = None
    avatar_url: str | None = None
    privacy: SellerGroupPrivacy
    invite_slug: str
    members_count: int
    created_at: datetime


class GroupMemberOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    opt_in_marketing: bool
    tags: list = []


# ----- Contacts -----

class ContactImportItem(BaseModel):
    phone: str = Field(min_length=4, max_length=24)
    display_name: str | None = Field(default=None, max_length=128)


class ContactImportIn(BaseModel):
    contacts: list[ContactImportItem] = Field(min_length=1, max_length=1000)


class ContactImportSummary(BaseModel):
    imported: int
    matched: int
    skipped: int
    contact_ids: list[int]


class ContactOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    display_name: str | None = None
    matched_user_id: int | None = None
    status: ContactImportStatus
    created_at: datetime


# ----- Broadcasts -----

class BroadcastCreateIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    body: str = Field(min_length=1, max_length=4000)
    target_type: BroadcastTargetType
    target_ref: str | None = None
    cta_type: BroadcastCta = BroadcastCta.NONE
    cta_product_id: int | None = None
    cta_url: str | None = Field(default=None, max_length=512)
    media: list[dict] | None = None
    scheduled_for: datetime | None = None


class BroadcastOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    title: str
    body: str
    target_type: BroadcastTargetType
    target_ref: str | None = None
    cta_type: BroadcastCta
    cta_product_id: int | None = None
    cta_url: str | None = None
    status: BroadcastStatus
    audience_count: int
    delivered_count: int
    failed_count: int
    clicked_count: int
    converted_count: int
    created_at: datetime


class BroadcastClickIn(BaseModel):
    """Mini App шлёт сюда `user_id` берётся из current_user."""

    # ничего — broadcast_id в пути.
    pass
