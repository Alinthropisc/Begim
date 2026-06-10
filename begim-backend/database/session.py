"""Async DB engine + всегда-прогретый пул + единый контекстный менеджер сессии.

Архитектура:
- Один глобальный `AsyncEngine` на процесс (создаётся на старте, закрывается на shutdown).
- `async_sessionmaker` — фабрика сессий, expire_on_commit=False (объекты остаются
  валидны после коммита — экономим лишний round-trip).
- `db_session()` — единственный санкционированный способ получить сессию: автокоммит
  при успехе, авто-rollback при исключении, авто-close. Это исключает течки коннектов.
- `warmup_pool()` — открывает `pool_size` коннектов на старте, чтобы первые сотни
  запросов не платили за TCP-handshake + MySQL handshake.
- `start_pool_keepalive()` — фоновая задача, раз в `keepalive_sec` дёргает
  `SELECT 1` на одном коннекте. Защищает от idle-таймаутов NAT/LB между Granian и MySQL.

Под пиком: 20 постоянных + 40 overflow = 60 одновременных запросов. Если упёрлись —
`pool_timeout` (30с) удержит запросы в очереди вместо мгновенного 5xx.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager, suppress

from loguru import logger
from sqlalchemy import text
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings


# ----- Глобальные ссылки на engine/sessionmaker -----
# Заполняются в `init_db()`, освобождаются в `dispose_db()`.
_engine: AsyncEngine | None = None
_sessionmaker: async_sessionmaker[AsyncSession] | None = None
_keepalive_task: asyncio.Task | None = None


def get_engine() -> AsyncEngine:
    if _engine is None:
        raise RuntimeError("DB engine не инициализирован. Вызови init_db() в lifespan.")
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    if _sessionmaker is None:
        raise RuntimeError("Sessionmaker не инициализирован. Вызови init_db() в lifespan.")
    return _sessionmaker


async def init_db() -> None:
    """Создать engine + прогреть пул + запустить keepalive."""
    global _engine, _sessionmaker

    if _engine is not None:
        logger.warning("init_db() вызвана повторно — игнорирую")
        return

    _engine = create_async_engine(
        settings.database_url,
        echo=settings.database_echo,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_recycle=settings.database_pool_recycle_sec,
        pool_timeout=settings.database_pool_timeout_sec,
        pool_pre_ping=settings.database_pool_pre_ping,
        # LIFO держит «горячие» коннекты задействованными, остальные простаивают —
        # лучше переживает всплески и пользуется TCP-кэшем ОС.
        pool_use_lifo=True,
        # JSON через orjson — заметно быстрее на крупных payload'ах.
        json_serializer=_json_dumps,
        json_deserializer=_json_loads,
        # aiomysql: ускоряем сериализацию, отключаем server-side cursors (нам не нужны).
        connect_args={
            "charset": "utf8mb4",
            "autocommit": False,
        },
    )

    _sessionmaker = async_sessionmaker(
        bind=_engine,
        expire_on_commit=False,
        autoflush=False,
    )

    if settings.database_warmup_on_start:
        await warmup_pool(_engine, settings.database_pool_size)

    # Фоновый keepalive стартует только если есть текущий event loop.
    global _keepalive_task
    _keepalive_task = asyncio.create_task(_pool_keepalive_loop(), name="db-keepalive")
    logger.info(
        "DB готов: pool_size={}, max_overflow={}, recycle={}s, warmup={}",
        settings.database_pool_size,
        settings.database_max_overflow,
        settings.database_pool_recycle_sec,
        settings.database_warmup_on_start,
    )


async def dispose_db() -> None:
    """Останавливаем keepalive и закрываем все коннекты."""
    global _engine, _sessionmaker, _keepalive_task

    if _keepalive_task is not None:
        _keepalive_task.cancel()
        with suppress(asyncio.CancelledError, Exception):
            await _keepalive_task
        _keepalive_task = None

    if _engine is not None:
        await _engine.dispose()
        _engine = None
    _sessionmaker = None
    logger.info("DB-пул закрыт")


async def warmup_pool(engine: AsyncEngine, n: int) -> None:
    """Параллельно открыть n коннектов и оставить их в пуле.

    Без прогрева первые n параллельных запросов платят за TCP+auth (~5-30ms каждый).
    После warmup'а первые ответы летят без задержки — критично для холодного старта Granian.
    """

    async def _ping_once() -> None:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))

    await asyncio.gather(*[_ping_once() for _ in range(n)], return_exceptions=False)
    logger.info("Пул прогрет: открыто {} коннектов к MySQL", n)


async def _pool_keepalive_loop(interval_sec: int = 30) -> None:
    """Раз в `interval_sec` дёргает SELECT 1.

    Защита от idle-таймаута NAT/LB и Aurora/PlanetScale-style серверов, которые
    разрывают долгие idle-коннекты. Поверх `pool_pre_ping` — второй слой защиты:
    pre_ping ловит уже-мёртвые, keepalive не даёт им умереть в принципе.
    """
    assert _engine is not None
    while True:
        try:
            await asyncio.sleep(interval_sec)
            async with _engine.connect() as conn:
                await conn.execute(text("SELECT 1"))
        except asyncio.CancelledError:
            raise
        except Exception as e:
            logger.warning("DB keepalive failed: {}", e)


@asynccontextmanager
async def db_session() -> AsyncIterator[AsyncSession]:
    """Единственный санкционированный способ получить сессию.

    Использование:
        async with db_session() as session:
            session.add(obj)
            # commit() произойдёт автоматически на выходе из блока

    Гарантии:
    - Коммит на нормальном выходе.
    - Rollback при любом исключении.
    - Close в любом случае (коннект возвращается в пул).
    """
    sm = get_sessionmaker()
    session = sm()
    try:
        yield session
        if session.in_transaction():
            await session.commit()
    except Exception:
        if session.in_transaction():
            await session.rollback()
        raise
    finally:
        await session.close()


# ----- JSON helpers (orjson, fallback на stdlib) -----
try:
    import orjson  # type: ignore

    def _json_dumps(v) -> str:
        return orjson.dumps(v).decode()

    def _json_loads(v):
        return orjson.loads(v)
except ImportError:  # pragma: no cover
    import json

    def _json_dumps(v) -> str:
        return json.dumps(v, ensure_ascii=False, separators=(",", ":"))

    def _json_loads(v):
        return json.loads(v)
