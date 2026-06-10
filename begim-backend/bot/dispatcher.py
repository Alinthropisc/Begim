"""aiogram Dispatcher с подключёнными handler'ами.

Поднимается в lifespan (polling) или через webhook. На MVP — polling в фоне.
"""
from __future__ import annotations

from aiogram import Dispatcher

from bot.handlers import start_router


def build_dispatcher() -> Dispatcher:
    dp = Dispatcher()
    dp.include_router(start_router)
    return dp
