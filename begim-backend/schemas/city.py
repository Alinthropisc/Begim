from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class CityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    name_uz: str
    name_ru: str
    name_en: str
    region: str | None = None
    is_active: bool
