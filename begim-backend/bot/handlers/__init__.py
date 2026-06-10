"""aiogram handlers — пока минимум /start и deep-link парсер."""

from bot.handlers.start import router as start_router

__all__ = ["start_router"]
