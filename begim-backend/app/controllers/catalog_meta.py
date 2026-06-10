"""Публичные справочники: города и категории. Кэш в Redis позже."""
from __future__ import annotations

from litestar import Controller, get

from app.config import settings
from repositories import UnitOfWork
from schemas.category import CategoryOut
from schemas.city import CityOut


class CityController(Controller):
    path = settings.api_prefix + "/cities"
    tags = ["meta"]

    @get("/")
    async def list_cities(self) -> list[CityOut]:
        async with UnitOfWork() as uow:
            items = await uow.cities.list_active()
            return [CityOut.model_validate(c) for c in items]


class CategoryController(Controller):
    path = settings.api_prefix + "/categories"
    tags = ["meta"]

    @get("/")
    async def list_categories(self) -> list[CategoryOut]:
        async with UnitOfWork() as uow:
            roots = await uow.categories.list_tree()
            return [CategoryOut.model_validate(c) for c in roots]
