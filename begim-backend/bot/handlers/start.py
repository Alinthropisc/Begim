"""/start обработчик с парсингом deep-link.

Поддерживаемые форматы:
- /start                       — стандартный onboarding
- /start s_<slug>              — открыть профиль продавца
- /start p_<product_id>        — открыть карточку товара
- /start p_<pid>_b_<bid>       — продукт + broadcast атрибуция
- /start o_<order_id>          — открыть заказ
- /start join_<invite_slug>    — присоединиться к клубу клиентов

Действие — отправляем сообщение с кнопкой WebApp, которая откроет Mini App
по соответствующему deep-link'у. Парсинг ровно того же кода — на стороне фронта.
"""
from __future__ import annotations

from aiogram import Router
from aiogram.filters import CommandStart, CommandObject
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    Message,
    WebAppInfo,
)

from app.config import settings


router = Router(name="start")


@router.message(CommandStart(deep_link=True))
async def cmd_start_deeplink(message: Message, command: CommandObject) -> None:
    payload = command.args or ""
    url = f"{settings.mini_app_url}?startapp={payload}"
    intro = _payload_intro(payload)
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Открыть в Begim", web_app=WebAppInfo(url=url))]]
    )
    await message.answer(intro, reply_markup=kb)


@router.message(CommandStart())
async def cmd_start_plain(message: Message) -> None:
    url = settings.mini_app_url
    kb = InlineKeyboardMarkup(
        inline_keyboard=[[InlineKeyboardButton(text="Открыть Begim", web_app=WebAppInfo(url=url))]]
    )
    await message.answer(
        "Salom! 👋 Begim — маркетплейс домашней выпечки. Открой Mini App и выбирай у соседей.",
        reply_markup=kb,
    )


def _payload_intro(payload: str) -> str:
    if payload.startswith("s_"):
        return "Открываю профиль продавца…"
    if payload.startswith("p_"):
        return "Открываю карточку товара…"
    if payload.startswith("o_"):
        return "Открываю ваш заказ…"
    if payload.startswith("join_"):
        return "Приглашение в клуб клиентов — нажмите кнопку, чтобы вступить."
    return "Открываю Begim…"
