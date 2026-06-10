"""
Begim Telegram Bot — запускает Mini App
"""

import asyncio
import logging
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import (
    WebAppInfo,
    ReplyKeyboardMarkup,
    KeyboardButton,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
)
from aiogram.enums import ParseMode

# Настройки
BOT_TOKEN = "YOUR_BOT_TOKEN_HERE"  # Вставь токен от @BotFather
WEBAPP_URL = "https://begim-mini-app.vercel.app"  # URL твоего Mini App

# Логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    """Приветствие + кнопка открытия Mini App"""
    
    # Inline кнопка с WebApp
    inline_kb = InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(
                text="🥮 Begim — Shirinliklar bozori",
                web_app=WebAppInfo(url=WEBAPP_URL)
            )
        ]
    ])
    
    await message.answer(
        f"🥮 <b>Assalomu alaykum, {message.from_user.first_name}!</b>\n\n"
        f"<b>Begim</b>ga xush kelibsiz — uy shirinliklari bozori!\n\n"
        f"🍰 Eng mazali tortlar\n"
        f"🍪 Milliy shirinliklar\n"
        f"👩‍🍳 Professional sotuvchilar\n\n"
        f"👇 Quyidagi tugmani bosing:",
        reply_markup=inline_kb,
        parse_mode=ParseMode.HTML
    )


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    """Помощь"""
    await message.answer(
        "📚 <b>Yordam</b>\n\n"
        "🥮 <b>Begim</b> — bu uy shirinliklari bozori.\n\n"
        "<b>Buyruqlar:</b>\n"
        "/start — Boshlash\n"
        "/myorders — Buyurtmalarim\n"
        "/cart — Savatcha\n"
        "/profile — Profil\n"
        "/seller — Sotuvchi bo'lish\n\n"
        "📞 Yordam kerak? @begim_support",
        parse_mode=ParseMode.HTML
    )


@dp.message(Command("myorders"))
async def cmd_myorders(message: types.Message):
    """Мои заказы"""
    await message.answer(
        "📦 <b>Mening buyurtmalarim</b>\n\n"
        "Hozircha buyurtmalar yo'q.\n\n"
        "👇 Katalogdan shirinliklarni tanlang:",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🛍️ Katalogga o'tish",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}/catalog")
                )
            ]
        ])
    )


@dp.message(Command("cart"))
async def cmd_cart(message: types.Message):
    """Корзина"""
    await message.answer(
        "🛒 <b>Savatcha</b>\n\n"
        "Savatchangizni Mini App ichida ko'rishingiz mumkin.",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🛒 Savatchani ochish",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}/cart")
                )
            ]
        ])
    )


@dp.message(Command("profile"))
async def cmd_profile(message: types.Message):
    """Профиль"""
    await message.answer(
        "👤 <b>Profil</b>\n\n"
        f"<b>Ism:</b> {message.from_user.first_name}\n"
        f"<b>Username:</b> @{message.from_user.username or 'yo\'q'}\n"
        f"<b>Telegram ID:</b> <code>{message.from_user.id}</code>",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="👤 Profilni ochish",
                    web_app=WebAppInfo(url=f"{WEBAPP_URL}/profile")
                )
            ]
        ]),
        parse_mode=ParseMode.HTML
    )


@dp.message(Command("seller"))
async def cmd_seller(message: types.Message):
    """Стать продавцом"""
    await message.answer(
        "👩‍🍳 <b>Sotuvchi bo'lish</b>\n\n"
        "O'z shirinliklaringizni soting va daromad oling!\n\n"
        "<b>Talablar:</b>\n"
        "✅ Uy sharoitida tayyorlash\n"
        "✅ Halol masalliqlar\n"
        "✅ Sifat kafolati\n\n"
        "📞 Bog'lanish: @begim_support",
        reply_markup=InlineKeyboardMarkup(inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📝 Ariza qoldirish",
                    url="https://t.me/begim_support"
                )
            ]
        ])
    )


async def main():
    """Запуск бота"""
    logger.info("🚀 Bot starting...")
    
    # Установить Menu Button
    await bot.set_chat_menu_button(
        menu_button=types.MenuButtonWebApp(
            text="🥮 Begim",
            web_app=WebAppInfo(url=WEBAPP_URL)
        )
    )
    logger.info("✅ Menu button set")
    
    # Запустить polling
    logger.info("🤖 Bot is running!")
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("👋 Bot stopped")
