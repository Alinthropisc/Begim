"""POST /orders, GET /orders/{id}, GET /me/orders, GET /seller/orders,
POST /orders/{id}/transition, POST /orders/{id}/cancel."""
from __future__ import annotations

from litestar import Controller, get, post
from litestar.di import Provide
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)
from litestar.params import Parameter

from app.config import settings
from app.lifecycle import get_arq, get_redis
from models.enums import OrderStatus
from models.user import User
from schemas.order import (
    OrderCancelIn,
    OrderCreateIn,
    OrderListOut,
    OrderOut,
    OrderTransitionIn,
)
from services.orders import (
    CreateOrderInput,
    OrderForbidden,
    OrderIllegalTransition,
    OrderInvalidItems,
    OrderItemInput,
    OrderMultiSeller,
    OrderNotFound,
    OrderService,
)


async def _enqueue_order_event(event: str, **payload) -> None:
    arq = get_arq()
    # Имя функции в воркере = имя события (registered ниже в WorkerSettings).
    await arq.enqueue_job(event, payload)


def _provide_order_service() -> OrderService:
    try:
        redis = get_redis()
    except RuntimeError:
        redis = None
    return OrderService(redis=redis, enqueue_event=_enqueue_order_event)


class OrdersController(Controller):
    """Покупательский флоу + просмотр."""

    path = settings.api_prefix + "/orders"
    tags = ["orders"]
    dependencies = {"order_service": Provide(_provide_order_service, sync_to_thread=False)}

    @post("/", status_code=201)
    async def create_order(
        self,
        data: OrderCreateIn,
        current_user: User,
        order_service: OrderService,
    ) -> OrderOut:
        try:
            order = await order_service.create(
                buyer_id=current_user.id,
                data=CreateOrderInput(
                    items=[OrderItemInput(**i.model_dump()) for i in data.items],
                    delivery_address=data.delivery_address,
                    delivery_city_id=data.delivery_city_id,
                    delivery_lat=data.delivery_lat,
                    delivery_lon=data.delivery_lon,
                    scheduled_for=data.scheduled_for,
                    buyer_comment=data.buyer_comment,
                    buyer_phone_e164=data.buyer_phone_e164,
                    delivery_fee_minor=data.delivery_fee_minor,
                    source_broadcast_id=data.source_broadcast_id,
                    source_channel_message_id=data.source_channel_message_id,
                    idempotency_key=data.idempotency_key,
                ),
            )
        except (OrderInvalidItems, OrderMultiSeller) as e:
            raise ClientException(detail=str(e)) from e
        return OrderOut.model_validate(order)

    @get("/{order_id:int}")
    async def get_order(
        self,
        order_id: int,
        current_user: User,
        order_service: OrderService,
    ) -> OrderOut:
        try:
            order = await order_service.get(current_user.id, current_user.role, order_id)
        except OrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except OrderForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return OrderOut.model_validate(order)

    @post("/{order_id:int}/transition")
    async def transition_order(
        self,
        order_id: int,
        data: OrderTransitionIn,
        current_user: User,
        order_service: OrderService,
    ) -> OrderOut:
        try:
            order = await order_service.transition(
                actor_user_id=current_user.id,
                actor_role=current_user.role,
                order_id=order_id,
                to_status=data.to_status,
                note=data.note,
            )
        except OrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except OrderForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except OrderIllegalTransition as e:
            raise ClientException(detail=str(e)) from e
        return OrderOut.model_validate(order)

    @post("/{order_id:int}/cancel")
    async def cancel_order(
        self,
        order_id: int,
        data: OrderCancelIn,
        current_user: User,
        order_service: OrderService,
    ) -> OrderOut:
        try:
            order = await order_service.cancel(
                actor_user_id=current_user.id,
                actor_role=current_user.role,
                order_id=order_id,
                reason=data.reason,
            )
        except OrderNotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except OrderForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except OrderIllegalTransition as e:
            raise ClientException(detail=str(e)) from e
        return OrderOut.model_validate(order)


class MyOrdersController(Controller):
    """Мои заказы (покупатель)."""

    path = settings.api_prefix + "/me/orders"
    tags = ["orders"]
    dependencies = {"order_service": Provide(_provide_order_service, sync_to_thread=False)}

    @get("/")
    async def list_my(
        self,
        current_user: User,
        order_service: OrderService,
        status: OrderStatus | None = Parameter(query="status", default=None),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=20),
    ) -> OrderListOut:
        items, total = await order_service.list_my_buyer(
            current_user.id, status=status, offset=offset, limit=limit
        )
        return OrderListOut(
            items=[OrderOut.model_validate(o) for o in items],
            total=total, offset=offset, limit=limit,
        )


class SellerOrdersController(Controller):
    """Заказы текущего продавца."""

    path = settings.api_prefix + "/seller/orders"
    tags = ["orders"]
    dependencies = {"order_service": Provide(_provide_order_service, sync_to_thread=False)}

    @get("/")
    async def list_seller(
        self,
        current_user: User,
        order_service: OrderService,
        status: OrderStatus | None = Parameter(query="status", default=None),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=20),
    ) -> OrderListOut:
        try:
            items, total = await order_service.list_my_seller(
                current_user.id, status=status, offset=offset, limit=limit
            )
        except OrderForbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return OrderListOut(
            items=[OrderOut.model_validate(o) for o in items],
            total=total, offset=offset, limit=limit,
        )
