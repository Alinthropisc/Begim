from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name_uz: str
    name_ru: str
    name_en: str
    icon: str | None = None
    parent_id: int | None = None
    sort_order: int = 0
    children: list[CategoryOut] = []
