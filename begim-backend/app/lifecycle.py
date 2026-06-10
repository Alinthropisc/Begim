"""Begim — lifespan и application factory.

Принципы:
- Один `Litestar`-app на процесс. Конфиг и DI собираются здесь.
- `lifespan` поднимает все долгоживущие ресурсы (БД, Redis, arq pool, бот)
  в правильном порядке и так же аккуратно их гасит.
- Сами контроллеры/middleware/роутеры подключаются по списку — добавление
  нового модуля = одна строчка, без правки factory.
"""

from __future__ import annotations

import asyncio
import os
from contextlib import asynccontextmanager, suppress
from typing import TYPE_CHECKING
from collections.abc import AsyncIterator

from litestar import Litestar
from litestar.config.cors import CORSConfig
from loguru import logger

from app.config import settings

if TYPE_CHECKING:
    from aiogram import Bot, Dispatcher
    from arq import ArqRedis
    from redis.asyncio import Redis


# ----- Глобальные ресурсы -----
_redis: Redis | None = None
_arq: ArqRedis | None = None
_bot: Bot | None = None
_dp: Dispatcher | None = None
_polling_task: asyncio.Task | None = None


def get_redis() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis не инициализирован")
    return _redis


def get_arq() -> ArqRedis:
    if _arq is None:
        raise RuntimeError("arq pool не инициализирован")
    return _arq


def get_bot() -> Bot:
    if _bot is None:
        raise RuntimeError("Bot не инициализирован (TELEGRAM_BOT_TOKEN не задан?)")
    return _bot


async def _init_redis() -> None:
    global _redis
    if settings.use_fakeredis:
        from fakeredis.aioredis import FakeRedis

        _redis = FakeRedis(decode_responses=True)
    else:
        from redis.asyncio import Redis

        _redis = Redis.from_url(
            settings.redis_url,
            decode_responses=True,
            health_check_interval=30,
            socket_keepalive=True,
            retry_on_timeout=True,
        )
    await _redis.ping()
    logger.info("Redis готов: {}", "fake" if settings.use_fakeredis else settings.redis_url)


async def _close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def _init_arq() -> None:
    """arq Redis pool — отдельный от обычного Redis, чтобы не смешивать
    бизнес-кэш и serialized job payload'ы."""
    global _arq
    from arq import create_pool
    from arq.connections import RedisSettings

    rs = RedisSettings.from_dsn(settings.redis_url)
    _arq = await create_pool(rs)
    logger.info("arq pool готов")


async def _close_arq() -> None:
    global _arq
    if _arq is not None:
        await _arq.aclose()  # type: ignore[attr-defined]
        _arq = None


async def _init_bot() -> None:
    """Aiogram Bot — лениво. Если токен пустой, сервис стартует без бота
    (для локальной разработки эндпоинтов API без TG-публикаций)."""
    global _bot
    if not settings.telegram_bot_token:
        logger.warning("TELEGRAM_BOT_TOKEN пуст — бот не инициализирован")
        return
    from aiogram import Bot
    from aiogram.client.default import DefaultBotProperties
    from aiogram.enums import ParseMode

    _bot = Bot(
        token=settings.telegram_bot_token,
        default=DefaultBotProperties(parse_mode=ParseMode.HTML),
    )
    me = await _bot.get_me()
    logger.info("Bot готов: @{}", me.username)


async def _close_bot() -> None:
    global _bot, _dp, _polling_task
    if _polling_task is not None:
        _polling_task.cancel()
        with suppress(asyncio.CancelledError, Exception):
            await _polling_task
        _polling_task = None
    if _dp is not None:
        await _dp.stop_polling()
        _dp = None
    if _bot is not None:
        await _bot.session.close()
        _bot = None


async def _start_bot_polling() -> None:
    """Запустить long-polling в фоне. Webhook раскатим позже отдельной настройкой."""
    global _dp, _polling_task
    if _bot is None or settings.telegram_webhook_url:
        return
    from bot.dispatcher import build_dispatcher

    _dp = build_dispatcher()
    _polling_task = asyncio.create_task(_dp.start_polling(_bot), name="bot-polling")
    logger.info("Bot polling запущен")


@asynccontextmanager
async def lifespan(app: Litestar) -> AsyncIterator[None]:
    """Startup → yield → shutdown."""
    from database import dispose_db, init_db

    logger.info("Begim starting, pid={}, env={}", os.getpid(), settings.app_env)

    # --- Startup ---
    await init_db()
    await _init_redis()
    await _init_arq()
    try:
        await _init_bot()
        await _start_bot_polling()
    except Exception as e:
        # Бот опционален в dev: лучше поднять API без него, чем уронить весь сервис.
        logger.warning("Bot init failed: {} (продолжаю без бота)", e)

    logger.info("Begim ready on {}", settings.api_prefix)
    try:
        yield
    finally:
        # --- Shutdown в обратном порядке ---
        logger.info("Begim shutting down...")
        await _close_bot()
        await _close_arq()
        await _close_redis()
        await dispose_db()
        logger.info("Begim stopped")


def create_app() -> Litestar:
    """Factory приложения.

    Контроллеры подключаются здесь по списку. Зависимости (`current_user`,
    `optional_user`) объявлены на уровне app и доступны любому handler'у по
    имени параметра.
    """
    from litestar import get
    from litestar.di import Provide

    from app.controllers.admin import AdminController
    from app.controllers.auth import AuthController
    from app.controllers.catalog_meta import CategoryController, CityController
    from app.controllers.me import MeController
    from app.controllers.orders import (
        MyOrdersController,
        OrdersController,
        SellerOrdersController,
    )
    from app.controllers.payments import PaymentsController, WebhooksController
    from app.controllers.products import ProductController
    from app.controllers.reviews import ReviewsController
    from app.controllers.sellers import SellerController
    from app.controllers.loyalty import (
        BroadcastTrackController,
        BroadcastsController,
        ContactsController,
        GroupJoinController,
        SellerGroupsController,
    )
    from app.controllers.social import (
        CommunityController,
        FollowController,
        NotificationsController,
        RecipesController,
        StoriesController,
    )
    from app.dependencies import provide_current_user, provide_optional_user

    @get("/health", sync_to_thread=False)
    def health() -> dict[str, str]:
        return {"status": "ok", "env": settings.app_env}

    @get(settings.api_prefix + "/ping", sync_to_thread=False)
    def ping() -> dict[str, str]:
        return {"pong": "begim"}

    return Litestar(
        route_handlers=[
            health,
            ping,
            AuthController,
            MeController,
            CityController,
            CategoryController,
            SellerController,
            ProductController,
            OrdersController,
            MyOrdersController,
            SellerOrdersController,
            PaymentsController,
            WebhooksController,
            ReviewsController,
            StoriesController,
            RecipesController,
            CommunityController,
            FollowController,
            NotificationsController,
            SellerGroupsController,
            GroupJoinController,
            ContactsController,
            BroadcastsController,
            BroadcastTrackController,
            AdminController,
        ],
        dependencies={
            "current_user": Provide(provide_current_user),
            "optional_user": Provide(provide_optional_user),
        },
        lifespan=[lifespan],
        debug=settings.debug,
        # Dev-CORS: фронты (Mini App :5174, бэк-офис :5173, туннели) ходят с других
        # origin'ов. Auth — Bearer-токены в заголовке (не куки), поэтому wildcard
        # безопасен. Для prod сузить до конкретных доменов.
        cors_config=CORSConfig(
            allow_origins=["*"],
            allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            allow_headers=["*"],
        ),
    )


# Приложение НЕ строим на уровне импорта — это вызывало падение под granian
# (worker форкается и импортирует модуль с частичным состоянием пакета `app`).
# Сервер вызывает фабрику сам: target="app.lifecycle:create_app", factory=True.
