"""OrderService — корзина → заказ + state machine.

Контракты:
- Один заказ = один продавец. Если фронт хочет купить у двух — он делает 2 POST'a.
- На момент create мы **снапшотим** title и цену каждого item'а в `OrderItem`
  (`title_snapshot`, `unit_price_minor`). Дальше Product может уйти в архив или
  поменять цену — заказ не «поедет».
- Атрибуция: `source_broadcast_id` (если открыт из рассылки) и
  `source_channel_message_id` (если из канала) принимаются на входе и сохраняются.
- **Idempotency-key**: одинаковый `(buyer_id, idem_key)` в течение TTL не создаёт
  второй заказ; возвращаем существующий. Ключ хранится в Redis.

State machine:
- Разрешённые переходы по роли — словарь констант. Это и есть Strategy: каждая
  роль = своя «таблица переходов».
- Любой переход пишет append-only `OrderStatusLog` и стреляет событие
  `notify_order_status_changed` (arq).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING, Any

from loguru import logger
from sqlalchemy import select

from app.config import settings
from models.enums import OrderStatus, ProductStatus, UserRole
from models.order import Order, OrderItem, OrderStatusLog
from models.product import Product
from repositories import UnitOfWork

if TYPE_CHECKING:
    from redis.asyncio import Redis


# ----- Exceptions -----

class OrderError(Exception):
    pass


class OrderNotFound(OrderError):
    pass


class OrderForbidden(OrderError):
    pass


class OrderInvalidItems(OrderError):
    pass


class OrderMultiSeller(OrderError):
    pass


class OrderIllegalTransition(OrderError):
    pass


# ----- DTO -----

@dataclass(slots=True)
class OrderItemInput:
    product_id: int
    qty: int = 1
    options: dict[str, Any] | None = None


@dataclass(slots=True)
class CreateOrderInput:
    items: list[OrderItemInput]
    delivery_address: str | None = None
    delivery_city_id: int | None = None
    delivery_lat: float | None = None
    delivery_lon: float | None = None
    scheduled_for: Any | None = None  # datetime | None
    buyer_comment: str | None = None
    buyer_phone_e164: str | None = None
    delivery_fee_minor: int = 0
    source_broadcast_id: int | None = None
    source_channel_message_id: int | None = None
    idempotency_key: str | None = None


# ----- State machine -----

FINAL_STATUSES = frozenset({OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED})


# Разрешённые переходы по роли. Все, что не описано — запрещено.
TRANSITIONS: dict[UserRole, dict[OrderStatus, frozenset[OrderStatus]]] = {
    UserRole.SELLER: {
        OrderStatus.NEW: frozenset({OrderStatus.ACCEPTED, OrderStatus.CANCELLED}),
        OrderStatus.ACCEPTED: frozenset({OrderStatus.IN_PROGRESS, OrderStatus.CANCELLED}),
        OrderStatus.IN_PROGRESS: frozenset({OrderStatus.READY, OrderStatus.CANCELLED}),
        OrderStatus.READY: frozenset({OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED}),
        OrderStatus.OUT_FOR_DELIVERY: frozenset({OrderStatus.DELIVERED}),
    },
    UserRole.CUSTOMER: {
        # Покупатель может только отменить «свежий» заказ.
        OrderStatus.NEW: frozenset({OrderStatus.CANCELLED}),
    },
    UserRole.ADMIN: {
        # Админ может ставить любой не-финальный статус.
        OrderStatus.NEW: frozenset(s for s in OrderStatus if s != OrderStatus.NEW),
        OrderStatus.ACCEPTED: frozenset(s for s in OrderStatus if s != OrderStatus.ACCEPTED),
        OrderStatus.IN_PROGRESS: frozenset(s for s in OrderStatus if s != OrderStatus.IN_PROGRESS),
        OrderStatus.READY: frozenset(s for s in OrderStatus if s != OrderStatus.READY),
        OrderStatus.OUT_FOR_DELIVERY: frozenset(s for s in OrderStatus if s != OrderStatus.OUT_FOR_DELIVERY),
    },
}


def _can_transition(role: UserRole, from_status: OrderStatus, to_status: OrderStatus) -> bool:
    if from_status in FINAL_STATUSES:
        return False
    allowed = TRANSITIONS.get(role, {}).get(from_status, frozenset())
    return to_status in allowed


# ----- Service -----

_IDEM_KEY = "order:idem:{buyer_id}:{key}"


class OrderService:
    """Use cases по заказам. Зависимости — конструктором → легко мокать."""

    def __init__(
        self,
        redis: Redis | None = None,
        uow_factory=UnitOfWork,
        enqueue_event=None,
        idempotency_ttl_sec: int = 60 * 60 * 24,
    ) -> None:
        self._redis = redis
        self._uow_factory = uow_factory
        self._enqueue_event = enqueue_event
        self._idem_ttl = idempotency_ttl_sec

    # ----- create -----

    async def create(self, buyer_id: int, data: CreateOrderInput) -> Order:
        if not data.items:
            raise OrderInvalidItems("items required")
        for it in data.items:
            if it.qty < 1:
                raise OrderInvalidItems(f"qty must be >= 1 (product_id={it.product_id})")

        # Idempotency: вернуть существующий заказ для (buyer, key).
        if data.idempotency_key and self._redis is not None:
            existing_id = await self._redis.get(_IDEM_KEY.format(buyer_id=buyer_id, key=data.idempotency_key))
            if existing_id:
                async with self._uow_factory() as uow:
                    existing = await uow.orders.get_with_items(int(existing_id))
                    if existing is not None:
                        return existing

        async with self._uow_factory() as uow:
            # Подтягиваем все товары одним запросом.
            product_ids = [it.product_id for it in data.items]
            products = (
                await uow.session.execute(
                    select(Product).where(Product.id.in_(product_ids))
                )
            ).scalars().all()
            by_id = {p.id: p for p in products}

            # Валидация: все продукты найдены, опубликованы, у одного продавца.
            seller_ids = set()
            subtotal_minor = 0
            order_items: list[OrderItem] = []
            for it in data.items:
                product = by_id.get(it.product_id)
                if product is None:
                    raise OrderInvalidItems(f"product not found: {it.product_id}")
                if product.status != ProductStatus.PUBLISHED:
                    raise OrderInvalidItems(f"product not available: {it.product_id}")
                if product.min_order_qty and it.qty < product.min_order_qty:
                    raise OrderInvalidItems(
                        f"min_order_qty for product {it.product_id} is {product.min_order_qty}"
                    )

                seller_ids.add(product.seller_id)
                line_minor = product.price_minor * it.qty
                subtotal_minor += line_minor
                order_items.append(
                    OrderItem(
                        product_id=product.id,
                        title_snapshot=product.title,
                        unit_price_minor=product.price_minor,
                        qty=it.qty,
                        options_snapshot=it.options or {},
                    )
                )

            if len(seller_ids) > 1:
                raise OrderMultiSeller("one order = one seller; split your cart")
            seller_id = seller_ids.pop()

            total = subtotal_minor + data.delivery_fee_minor

            order = Order(
                buyer_id=buyer_id,
                seller_id=seller_id,
                subtotal_minor=subtotal_minor,
                delivery_fee_minor=data.delivery_fee_minor,
                total_minor=total,
                delivery_address=data.delivery_address,
                delivery_city_id=data.delivery_city_id,
                delivery_lat=data.delivery_lat,
                delivery_lon=data.delivery_lon,
                scheduled_for=data.scheduled_for,
                buyer_comment=data.buyer_comment,
                buyer_phone_e164=data.buyer_phone_e164,
                source_broadcast_id=data.source_broadcast_id,
                source_channel_message_id=data.source_channel_message_id,
                status=OrderStatus.NEW,
            )
            order.items = order_items
            uow.session.add(order)
            await uow.flush()

            # Лог создания: from=None → to=NEW. actor — сам покупатель.
            uow.session.add(
                OrderStatusLog(
                    order_id=order.id,
                    from_status=None,
                    to_status=OrderStatus.NEW,
                    actor_user_id=buyer_id,
                    note="order created",
                )
            )
            await uow.flush()
            order_id = order.id

        # Idempotency: сохраним key → order_id.
        if data.idempotency_key and self._redis is not None:
            await self._redis.set(
                _IDEM_KEY.format(buyer_id=buyer_id, key=data.idempotency_key),
                str(order_id),
                ex=self._idem_ttl,
            )

        await self._fire("order_created", order_id, buyer_id, None, OrderStatus.NEW)

        # Возвращаем уже загруженный с items объект.
        async with self._uow_factory() as uow:
            fresh = await uow.orders.get_with_items(order_id)
            assert fresh is not None
            return fresh

    # ----- read -----

    async def get(self, viewer_user_id: int, viewer_role: UserRole, order_id: int) -> Order:
        async with self._uow_factory() as uow:
            order = await uow.orders.get_with_items(order_id)
            if order is None:
                raise OrderNotFound("order not found")
            await self._assert_can_view(uow, order, viewer_user_id, viewer_role)
            return order

    async def list_my_buyer(
        self,
        buyer_id: int,
        *,
        status: OrderStatus | None = None,
        offset: int = 0,
        limit: int = 20,
    ):
        async with self._uow_factory() as uow:
            return await uow.orders.list_for_buyer(
                buyer_id, status=status, offset=offset, limit=min(max(limit, 1), 50)
            )

    async def list_my_seller(
        self,
        user_id: int,
        *,
        status: OrderStatus | None = None,
        offset: int = 0,
        limit: int = 20,
    ):
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise OrderForbidden("not a seller")
            return await uow.orders.list_for_seller(
                seller.id, status=status, offset=offset, limit=min(max(limit, 1), 50)
            )

    # ----- transitions -----

    async def transition(
        self,
        actor_user_id: int,
        actor_role: UserRole,
        order_id: int,
        to_status: OrderStatus,
        *,
        note: str | None = None,
    ) -> Order:
        async with self._uow_factory() as uow:
            order = await uow.orders.get_with_items(order_id)
            if order is None:
                raise OrderNotFound("order not found")
            await self._assert_can_act(uow, order, actor_user_id, actor_role)

            from_status = order.status
            if not _can_transition(actor_role, from_status, to_status):
                raise OrderIllegalTransition(
                    f"role={actor_role.value} cannot transition {from_status.value} → {to_status.value}"
                )

            order.status = to_status
            uow.session.add(
                OrderStatusLog(
                    order_id=order.id,
                    from_status=from_status,
                    to_status=to_status,
                    actor_user_id=actor_user_id,
                    note=note,
                )
            )
            await uow.flush()
            order_id_final = order.id
            from_final = from_status
            to_final = to_status
            buyer_id_final = order.buyer_id

        await self._fire("order_status_changed", order_id_final, buyer_id_final, from_final, to_final)

        async with self._uow_factory() as uow:
            fresh = await uow.orders.get_with_items(order_id_final)
            assert fresh is not None
            return fresh

    async def cancel(
        self,
        actor_user_id: int,
        actor_role: UserRole,
        order_id: int,
        reason: str | None = None,
    ) -> Order:
        order = await self.transition(
            actor_user_id, actor_role, order_id, OrderStatus.CANCELLED, note=reason
        )
        if reason:
            async with self._uow_factory() as uow:
                fresh = await uow.orders.get_with_items(order_id)
                if fresh is not None:
                    fresh.cancelled_reason = reason
        return order

    # ----- helpers -----

    async def _assert_can_view(self, uow: UnitOfWork, order: Order, user_id: int, role: UserRole) -> None:
        if role == UserRole.ADMIN:
            return
        if order.buyer_id == user_id:
            return
        seller = await uow.sellers.get_by_user_id(user_id)
        if seller is not None and seller.id == order.seller_id:
            return
        raise OrderForbidden("not your order")

    async def _assert_can_act(self, uow: UnitOfWork, order: Order, user_id: int, role: UserRole) -> None:
        if role == UserRole.ADMIN:
            return
        if role == UserRole.CUSTOMER:
            if order.buyer_id != user_id:
                raise OrderForbidden("not your order")
            return
        if role == UserRole.SELLER:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None or seller.id != order.seller_id:
                raise OrderForbidden("not your order")
            return
        raise OrderForbidden(f"role {role.value} cannot act")

    async def _fire(
        self,
        event: str,
        order_id: int,
        buyer_id: int,
        from_status: OrderStatus | None,
        to_status: OrderStatus,
    ) -> None:
        if self._enqueue_event is None:
            return
        try:
            await self._enqueue_event(
                event,
                order_id=order_id,
                buyer_id=buyer_id,
                from_status=from_status.value if from_status else None,
                to_status=to_status.value,
            )
        except Exception as e:
            logger.warning("enqueue order event {} failed: {}", event, e)
