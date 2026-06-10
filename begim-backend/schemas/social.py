from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.enums import DifficultyLevel, NotificationType


# ----- Stories -----

class StoryCreateIn(BaseModel):
    media_url: str = Field(min_length=4, max_length=512)
    media_type: str = Field(default="image", pattern=r"^(image|video)$")
    tg_file_id: str | None = Field(default=None, max_length=256)
    caption: str | None = Field(default=None, max_length=512)
    product_id: int | None = None


class StoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seller_id: int
    media_url: str
    media_type: str
    caption: str | None = None
    product_id: int | None = None
    expires_at: datetime
    views_count: int
    created_at: datetime


# ----- Recipes -----

class RecipeCreateIn(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    description: str | None = Field(default=None, max_length=8000)
    cover_url: str | None = None
    cook_time_min: int | None = Field(default=None, ge=0)
    servings: int | None = Field(default=None, ge=1)
    difficulty: DifficultyLevel = DifficultyLevel.EASY
    ingredients: list[dict] | None = None
    steps: list[dict] | None = None
    tags: list[str] | None = None
    city_id: int | None = None


class RecipeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    city_id: int | None = None
    title: str
    description: str | None = None
    cover_url: str | None = None
    cook_time_min: int | None = None
    servings: int | None = None
    difficulty: DifficultyLevel
    ingredients: list = []
    steps: list = []
    tags: list = []
    likes_count: int
    comments_count: int
    saves_count: int
    created_at: datetime


class RecipeListOut(BaseModel):
    items: list[RecipeOut]
    total: int
    offset: int
    limit: int


# ----- Community -----

class PostCreateIn(BaseModel):
    body: str = Field(min_length=1, max_length=4000)
    photos: list[str] | None = None
    tags: list[str] | None = None
    product_id: int | None = None
    city_id: int | None = None


class PostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_id: int
    city_id: int | None = None
    product_id: int | None = None
    body: str
    photos: list = []
    tags: list = []
    likes_count: int
    comments_count: int
    created_at: datetime


class PostListOut(BaseModel):
    items: list[PostOut]
    total: int
    offset: int
    limit: int


# ----- Notifications -----

class NotificationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: NotificationType
    title: str
    body: str | None = None
    payload: dict = {}
    read_at: datetime | None = None
    created_at: datetime


class NotificationListOut(BaseModel):
    items: list[NotificationOut]
    total: int
    offset: int
    limit: int
