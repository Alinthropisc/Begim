"""POST /orders/{id}/payments, GET /payments/{id}, POST /webhooks/{provider}."""
from __future__ import annotations

from urllib.parse import parse_qsl

from litestar import Controller, Request, Response, get, post
from litestar.di import Provide
from litestar.enums import RequestEncodingType
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)

from app.config import settings
from app.lifecycle import get_arq
from models.enums import PaymentProvider as PaymentProviderEnum
from models.user import User
from schemas.payment import CheckoutOut, PaymentCreateIn, PaymentOut
from services.payment_service import (
    PaymentForbidden,
    PaymentInvalidState,
    PaymentOrderNotFound,
    PaymentService,
)


async def _enqueue_event(event: str, **payload) -> None:
    arq = get_arq()
    await arq.enqueue_job(event, payload)


def _provide_payment_service() -> PaymentService:
    return PaymentService(enqueue_event=_enqueue_event)


class PaymentsController(Controller):
    path = settings.api_prefix
    tags = ["payments"]
    dependencies = {"payment_service": Provide(_provide_payment_service, sync_to_thread=False)}

    @post("/orders/{order_id:int}/payments", status_code=201)
    async def create(
        self,
        order_id: int,
        data: PaymentCreateIn,
        current_user: User,
        payment_service: PaymentService,
    ) -> CheckoutOut:
        try:
            result = await payment_service.create_payment(
                order_id=order_id,
                provider=data.provider,
                actor_user_id=current_user.id,
            )
        except PaymentOrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except PaymentForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except PaymentInvalidState as e:
            raise ClientException(detail=str(e)) from e
        return CheckoutOut(
            payment=PaymentOut.model_validate(result.payment),
            checkout_url=result.checkout.url,
            extra=result.checkout.extra,
        )

    @get("/payments/{payment_id:int}")
    async def get_payment(
        self,
        payment_id: int,
        current_user: User,
        payment_service: PaymentService,
    ) -> PaymentOut:
        try:
            payment = await payment_service.get(payment_id, current_user.id, current_user.role)
        except PaymentOrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except PaymentForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return PaymentOut.model_validate(payment)


class WebhooksController(Controller):
    path = settings.api_prefix + "/webhooks"
    tags = ["webhooks"]
    dependencies = {"payment_service": Provide(_provide_payment_service, sync_to_thread=False)}
    # Вебхуки — публичные, без current_user. Дополнительная защита — подпись провайдера.

    @post("/payme")
    async def payme(self, request: Request, payment_service: PaymentService) -> Response:
        raw = await request.body()
        headers = {k.decode(): v.decode() for k, v in request.scope["headers"]}
        try:
            payload = await request.json()
        except Exception:
            payload = {}
        result = await payment_service.handle_webhook(
            PaymentProviderEnum.PAYME, headers, raw, payload
        )
        return Response(content=result or {"ok": True}, status_code=200)

    @post("/click")
    async def click(self, request: Request, payment_service: PaymentService) -> Response:
        raw = await request.body()
        headers = {k.decode(): v.decode() for k, v in request.scope["headers"]}
        # Click шлёт application/x-www-form-urlencoded
        payload = dict(parse_qsl(raw.decode("utf-8", errors="ignore"), keep_blank_values=True))
        result = await payment_service.handle_webhook(
            PaymentProviderEnum.CLICK, headers, raw, payload
        )
        return Response(content=result or {"ok": True}, status_code=200)
