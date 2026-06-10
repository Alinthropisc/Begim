"""arq tasks. Каждая таска — async-функция первым аргументом получает `ctx`.

Запуск воркера:
    uv run arq worker.main.WorkerSettings
"""

from __future__ import annotations

from datetime import datetime, timezone, UTC
from typing import Any

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from aiogram.types import InlineKeyboardButton, InlineKeyboardMarkup
from loguru import logger
from sqlalchemy import select

from app.config import settings
from database import db_session, dispose_db, init_db
from models.channel_post import ChannelPost
from models.enums import NotificationType, ProductStatus
from models.notification import Notification
from models.order import Order
from models.product import Product
from models.user import User


# ----- arq lifecycle hooks -----


async def on_startup(ctx: dict[str, Any]) -> None:
    """Поднимаем БД и бота под воркера. Бот = отдельный экземпляр от API'шного."""
    await init_db()
    if not settings.telegram_bot_token:
        logger.warning("worker: TELEGRAM_BOT_TOKEN пуст — публикация в канал отключена")
        ctx["bot"] = None
    else:
        ctx["bot"] = Bot(
            token=settings.telegram_bot_token,
            default=DefaultBotProperties(parse_mode=ParseMode.HTML),
        )
        me = await ctx["bot"].get_me()
        logger.info("worker bot ready: @{}", me.username)


async def on_shutdown(ctx: dict[str, Any]) -> None:
    bot: Bot | None = ctx.get("bot")
    if bot is not None:
        await bot.session.close()
    await dispose_db()


# ----- tasks -----


async def publish_to_channel(ctx: dict[str, Any], product_id: int) -> dict[str, Any]:
    """Опубликовать товар в глобальный канал @begim.

    Идемпотентно: если для product_id уже есть `ChannelPost`, обновляем пост
    вместо повторной публикации.
    """
    bot: Bot | None = ctx.get("bot")
    if bot is None:
        logger.warning("publish_to_channel: бот не доступен, пропускаю product_id={}", product_id)
        return {"skipped": True, "reason": "no_bot"}
    if settings.global_channel_id is None:
        logger.warning("publish_to_channel: GLOBAL_CHANNEL_ID не задан")
        return {"skipped": True, "reason": "no_channel"}

    async with db_session() as session:
        product = (await session.execute(select(Product).where(Product.id == product_id))).scalar_one_or_none()
        if product is None or product.status != ProductStatus.PUBLISHED:
            return {"skipped": True, "reason": "product_missing_or_unpublished"}

        existing = (await session.execute(select(ChannelPost).where(ChannelPost.product_id == product_id))).scalar_one_or_none()

        text = _format_product_post(product)
        kb = _product_keyboard(product.id)

        if existing is not None:
            # Edit
            try:
                await bot.edit_message_caption(
                    chat_id=settings.global_channel_id,
                    message_id=existing.message_id,
                    caption=text,
                    reply_markup=kb,
                )
                existing.last_edited_at = datetime.now(UTC)
                return {"edited": True, "message_id": existing.message_id}
            except Exception as e:
                logger.warning("edit failed, repost: {}", e)
                # Удалим запись и попробуем опубликовать заново — пост мог быть удалён вручную.
                await session.delete(existing)
                await session.flush()

        # First publish. На старте — text-only для надёжности.
        # Фото подключим, когда будет реальный аплоад в `/products/{id}/photos`.
        msg = await bot.send_message(
            chat_id=settings.global_channel_id,
            text=text,
            reply_markup=kb,
        )

        cp = ChannelPost(
            product_id=product.id,
            channel_id=settings.global_channel_id,
            message_id=msg.message_id,
            posted_at=datetime.now(UTC),
        )
        session.add(cp)
        return {"published": True, "message_id": msg.message_id}


async def order_created(ctx: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    """Событие `order_created`: уведомляем продавца и покупателя.

    payload = {order_id, buyer_id, from_status, to_status}
    """
    bot: Bot | None = ctx.get("bot")
    order_id = int(payload["order_id"])

    async with db_session() as session:
        order = (await session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
        if order is None:
            return {"skipped": True}

        # in-app notifications обеим сторонам
        session.add(
            Notification(
                user_id=order.buyer_id,
                type=NotificationType.ORDER_NEW,
                title="Заказ создан",
                body=f"Ваш заказ №{order.id} принят к обработке",
                payload={"order_id": order.id},
            )
        )
        # seller_id ссылается на SellerProfile.id — найдём user
        seller_user_id = await _seller_user_id(session, order.seller_id)
        if seller_user_id is not None:
            session.add(
                Notification(
                    user_id=seller_user_id,
                    type=NotificationType.ORDER_NEW,
                    title="Новый заказ!",
                    body=f"Поступил заказ №{order.id} на {order.total_minor // 100} UZS",
                    payload={"order_id": order.id},
                )
            )

        # TG DM продавцу
        if bot is not None and seller_user_id is not None:
            seller_user = await session.get(User, seller_user_id)
            if seller_user is not None and not seller_user.is_blocked:
                try:
                    await bot.send_message(
                        chat_id=seller_user.tg_id,
                        text=(f"🛒 <b>Новый заказ №{order.id}</b>\nСумма: <b>{order.total_minor // 100} UZS</b>\nОткрыть в Mini App: {settings.mini_app_url}?startapp=o_{order.id}"),
                    )
                except Exception as e:
                    logger.warning("tg notify seller failed: {}", e)

    return {"ok": True}


async def order_status_changed(ctx: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    """Событие `order_status_changed`: уведомляем покупателя.

    payload = {order_id, buyer_id, from_status, to_status}
    """
    bot: Bot | None = ctx.get("bot")
    order_id = int(payload["order_id"])
    to_status = payload["to_status"]

    async with db_session() as session:
        order = (await session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
        if order is None:
            return {"skipped": True}

        title = f"Статус заказа №{order.id}"
        body = f"Новый статус: {to_status}"

        session.add(
            Notification(
                user_id=order.buyer_id,
                type=NotificationType.ORDER_STATUS,
                title=title,
                body=body,
                payload={"order_id": order.id, "to_status": to_status},
            )
        )

        if bot is not None:
            buyer = await session.get(User, order.buyer_id)
            if buyer is not None and not buyer.is_blocked:
                try:
                    await bot.send_message(
                        chat_id=buyer.tg_id,
                        text=(f"📦 <b>{title}</b>\n{body}\nПодробнее: {settings.mini_app_url}?startapp=o_{order.id}"),
                    )
                except Exception as e:
                    logger.warning("tg notify buyer failed: {}", e)

    return {"ok": True}


async def payment_paid(ctx: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    """Уведомить покупателя об успешном платеже."""
    bot: Bot | None = ctx.get("bot")
    order_id = int(payload["order_id"])
    async with db_session() as session:
        order = (await session.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
        if order is None:
            return {"skipped": True}
        session.add(
            Notification(
                user_id=order.buyer_id,
                type=NotificationType.PAYMENT_PAID,
                title="Оплата прошла",
                body=f"Заказ №{order.id} оплачен — ждите подтверждения продавца",
                payload={"order_id": order.id},
            )
        )
        if bot is not None:
            buyer = await session.get(User, order.buyer_id)
            if buyer is not None and not buyer.is_blocked:
                try:
                    await bot.send_message(
                        chat_id=buyer.tg_id,
                        text=f"✅ Оплата прошла. Заказ №{order.id} оплачен.",
                    )
                except Exception as e:
                    logger.warning("tg notify paid failed: {}", e)
    return {"ok": True}


async def _seller_user_id(session, seller_profile_id: int) -> int | None:
    from models.seller_profile import SellerProfile

    sp = await session.get(SellerProfile, seller_profile_id)
    return sp.user_id if sp is not None else None


async def unpublish_from_channel(ctx: dict[str, Any], product_id: int) -> dict[str, Any]:
    bot: Bot | None = ctx.get("bot")
    if bot is None or settings.global_channel_id is None:
        return {"skipped": True}

    async with db_session() as session:
        cp = (await session.execute(select(ChannelPost).where(ChannelPost.product_id == product_id))).scalar_one_or_none()
        if cp is None:
            return {"skipped": True}
        try:
            await bot.delete_message(chat_id=cp.channel_id, message_id=cp.message_id)
        except Exception as e:
            logger.warning("delete tg msg failed: {}", e)
        await session.delete(cp)
        return {"unpublished": True}


# ----- formatting -----


def _format_product_post(product: Product) -> str:
    price = _fmt_price(product.price_minor, product.currency.value if hasattr(product.currency, "value") else product.currency)
    parts = [
        f"<b>{_html_escape(product.title)}</b>",
        "",
        _html_escape((product.description or "").strip()) or "",
        "",
        f"💰 <b>{price}</b>",
    ]
    if product.prep_time_hours:
        parts.append(f"⏱ за {product.prep_time_hours}ч")
    parts.append(f"\n#begim #id{product.id}")
    return "\n".join(p for p in parts if p is not None)


def _product_keyboard(product_id: int) -> InlineKeyboardMarkup:
    deep_link = f"{settings.mini_app_url}?startapp=p_{product_id}"
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="🛒 Заказать", url=deep_link)],
            [InlineKeyboardButton(text="🏪 Открыть продавца", url=deep_link + "_seller")],
        ]
    )


def _fmt_price(minor: int, currency: str) -> str:
    sums = minor // 100
    return f"{sums:,} {currency}".replace(",", " ")


def _html_escape(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
