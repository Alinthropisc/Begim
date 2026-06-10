"""POST /sellers, GET /sellers/{id_or_slug}, PATCH /sellers/me."""
from __future__ import annotations

from litestar import Controller, get, patch, post
from litestar.di import Provide
from litestar.exceptions import ClientException, NotFoundException

from app.config import settings
from models.user import User
from schemas.seller import (
    SellerCreateIn,
    SellerOwnerOut,
    SellerPublicOut,
    SellerUpdateIn,
)
from services.sellers import (
    CreateSellerInput,
    SellerAlreadyExists,
    SellerNotFound,
    SellerService,
    UpdateSellerInput,
)


def _provide_seller_service() -> SellerService:
    return SellerService()


class SellerController(Controller):
    path = settings.api_prefix + "/sellers"
    tags = ["sellers"]
    dependencies = {"seller_service": Provide(_provide_seller_service, sync_to_thread=False)}

    @post("/", status_code=201)
    async def become_seller(
        self,
        data: SellerCreateIn,
        current_user: User,
        seller_service: SellerService,
    ) -> SellerOwnerOut:
        try:
            seller = await seller_service.become_seller(
                user_id=current_user.id,
                data=CreateSellerInput(
                    brand_name=data.brand_name,
                    bio=data.bio,
                    contact_phone_e164=data.contact_phone_e164,
                    contact_tg_username=data.contact_tg_username,
                    city_id=data.city_id,
                ),
            )
        except SellerAlreadyExists as e:
            raise ClientException(detail=str(e)) from e
        return SellerOwnerOut.model_validate(seller)

    @patch("/me")
    async def update_my(
        self,
        data: SellerUpdateIn,
        current_user: User,
        seller_service: SellerService,
    ) -> SellerOwnerOut:
        try:
            seller = await seller_service.update_my(
                user_id=current_user.id,
                data=UpdateSellerInput(**data.model_dump(exclude_unset=True)),
            )
        except SellerNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return SellerOwnerOut.model_validate(seller)

    @get("/{id_or_slug:str}")
    async def get_public(
        self,
        id_or_slug: str,
        seller_service: SellerService,
    ) -> SellerPublicOut:
        try:
            seller, _user = await seller_service.get_public(id_or_slug)
        except SellerNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return SellerPublicOut.model_validate(seller)
