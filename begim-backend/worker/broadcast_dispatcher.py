"""dispatch_broadcast_chunk — сердце Lazy Data Stream.

Берёт батч `queued` доставок с `FOR UPDATE SKIP LOCKED`, шлёт TG-DM,
обновляет статусы, ставит себя в очередь снова. Когда пусто — финализирует
broadcast в `SENT`.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from aiogram import Bot
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from loguru import logger
from sqlalchemy import select, text, update

from app.config import settings
from database import db_session
from models.broadcast import Broadcast, BroadcastDelivery
from models.enums import BroadcastCta, BroadcastDeliveryStatus, BroadcastStatus
from models.user import User


BATCH = 25                 # TG лимит ~30 msg/s; берём с запасом
COOLDOWN_SEC = 1.0         # пауза между батчами


async def dispatch_broadcast_chunk(ctx: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    bot: Bot | None = ctx.get("bot")
    broadcast_id = int(payload["broadcast_id"])
    if bot is None:
        logger.warning("dispatch: бот не доступен, broadcast_id={}", broadcast_id)
        return {"skipped": True}

    async with db_session() as session:
        broadcast = await session.get(Broadcast, broadcast_id)
        if broadcast is None or broadcast.status in (BroadcastStatus.CANCELLED, BroadcastStatus.FAILED):
            return {"skipped": True}
        if broadcast.status == BroadcastStatus.QUEUED:
            broadcast.status = BroadcastStatus.SENDING

        # Берём батч в `sending` через FOR UPDATE SKIP LOCKED — если параллельно
        # запущено несколько диспетчеров, они не дерутся за одну строку.
        rows = (
            await session.execute(
                text(
                    """
                    SELECT id, user_id FROM broadcast_deliveries
                    WHERE broadcast_id = :bid AND status = 'queued'
                    ORDER BY id
                    LIMIT :batch
                    FOR UPDATE SKIP LOCKED
                    """
                ).bindparams(bid=broadcast_id, batch=BATCH)
            )
        ).all()
        if not rows:
            broadcast.status = BroadcastStatus.SENT
            broadcast.sent_at = datetime.now(timezone.utc)
            return {"done": True}

        delivery_ids = [int(r[0]) for r in rows]
        user_ids = [int(r[1]) for r in rows]

        # Помечаем `sending`, чтобы повторный батч их не подцепил.
        await session.execute(
            update(BroadcastDelivery)
            .where(BroadcastDelivery.id.in_(delivery_ids))
            .values(status=BroadcastDeliveryStatus.SENDING)
        )
        # snapshot нужных полей до выхода из транзакции
        title = broadcast.title
        body = broadcast.body
        cta_type = broadcast.cta_type
        cta_product_id = broadcast.cta_product_id
        cta_url = broadcast.cta_url

        users_map = {
            u.id: u
            for u in (
                await session.execute(select(User).where(User.id.in_(user_ids)))
            ).scalars().all()
        }

    # Шлём вне транзакции — внешние HTTP-запросы не должны её держать.
    sent_ok = 0
    sent_fail = 0
    deliveries_updates: list[tuple[int, str, str | None]] = []  # (delivery_id, status, error)

    kb = _make_keyboard(broadcast_id, cta_type, cta_product_id, cta_url)
    text_msg = _format_text(title, body)

    for did, uid in zip(delivery_ids, user_ids):
        user = users_map.get(uid)
        if user is None or user.is_blocked:
            deliveries_updates.append((did, BroadcastDeliveryStatus.SKIPPED.value, "user_unavailable"))
            continue
        try:
            await bot.send_message(chat_id=user.tg_id, text=text_msg, reply_markup=kb)
            sent_ok += 1
            deliveries_updates.append((did, BroadcastDeliveryStatus.DELIVERED.value, None))
        except Exception as e:  # noqa: BLE001
            sent_fail += 1
            deliveries_updates.append((did, BroadcastDeliveryStatus.FAILED.value, str(e)[:200]))

    # Закрываем апдейтами в одной транзакции.
    async with db_session() as session:
        for did, st, err in deliveries_updates:
            stmt = (
                update(BroadcastDelivery)
                .where(BroadcastDelivery.id == did)
                .values(
                    status=BroadcastDeliveryStatus(st),
                    delivered_at=datetime.now(timezone.utc) if st == "delivered" else None,
                    error_message=err,
                    attempts=BroadcastDelivery.attempts + 1,
                )
            )
            await session.execute(stmt)
        broadcast = await session.get(Broadcast, broadcast_id)
        if broadcast is not None:
            broadcast.delivered_count = (broadcast.delivered_count or 0) + sent_ok
            broadcast.failed_count = (broadcast.failed_count or 0) + sent_fail

    # Ставим следующий чанк с задержкой — соблюдаем TG rate.
    arq = ctx.get("redis")
    if arq is not None:
        try:
            await arq.enqueue_job(
                "dispatch_broadcast_chunk",
                {"broadcast_id": broadcast_id},
                _defer_by=COOLDOWN_SEC,
            )
        except Exception as e:  # noqa: BLE001
            logger.warning("re-enqueue dispatch_broadcast_chunk failed: {}", e)

    return {"sent": sent_ok, "failed": sent_fail}


# ----- helpers -----

def _format_text(title: str, body: str) -> str:
    return f"<b>{_html(title)}</b>\n\n{_html(body)}"


def _make_keyboard(
    broadcast_id: int,
    cta_type: BroadcastCta,
    cta_product_id: int | None,
    cta_url: str | None,
) -> InlineKeyboardMarkup | None:
    base = settings.mini_app_url
    if cta_type == BroadcastCta.NONE:
        return None
    if cta_type == BroadcastCta.OPEN_PRODUCT and cta_product_id:
        url = f"{base}?startapp=p_{cta_product_id}_b_{broadcast_id}"
        return InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="🛒 Посмотреть", url=url)]]
        )
    if cta_type == BroadcastCta.ORDER_NOW and cta_product_id:
        url = f"{base}?startapp=p_{cta_product_id}_b_{broadcast_id}_order"
        return InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="🛒 Заказать сейчас", url=url)]]
        )
    if cta_type == BroadcastCta.EXTERNAL_URL and cta_url:
        return InlineKeyboardMarkup(
            inline_keyboard=[[InlineKeyboardButton(text="🔗 Открыть", url=cta_url)]]
        )
    return None


def _html(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
