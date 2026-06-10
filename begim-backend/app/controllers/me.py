"""GET /me, PATCH /me — текущий пользователь и его настройки."""
from __future__ import annotations

from litestar import Controller, get, patch

from app.config import settings
from models.user import User
from repositories import UnitOfWork
from schemas.user import UserMeUpdate, UserOut


class MeController(Controller):
    path = settings.api_prefix + "/me"
    tags = ["me"]

    @get("/")
    async def get_me(self, current_user: User) -> UserOut:
        return UserOut.model_validate(current_user)

    @patch("/")
    async def patch_me(self, current_user: User, data: UserMeUpdate) -> UserOut:
        async with UnitOfWork() as uow:
            user = await uow.users.get_by_id(current_user.id)
            assert user is not None  # current_user уже прошёл провайдер
            if data.display_name is not None:
                user.display_name = data.display_name
            if data.locale is not None:
                user.locale = data.locale
            if data.city_id is not None:
                user.city_id = data.city_id
            if data.marketing_opt_in is not None:
                user.marketing_opt_in = data.marketing_opt_in
            await uow.flush()
            return UserOut.model_validate(user)
