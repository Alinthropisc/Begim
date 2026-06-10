"""Begim backend entrypoint.

Запуск (dev):
    uv run python main.py

Запуск (prod) через Granian:
    uv run granian --interface asgi --factory app.lifecycle:create_app \\
        --host 0.0.0.0 --port 8000 --workers 4 --loop uvloop

Активация uvloop ДО создания event-loop'а Granian/asyncio даёт ~30% быстрее
async I/O — критично для arq-воркера и aiogram'а.
"""
from __future__ import annotations

import sys


def _install_uvloop() -> None:
    """Поставить uvloop как event loop policy, если он установлен."""
    if sys.platform == "win32":
        return
    try:
        import uvloop  # type: ignore

        uvloop.install()
    except ImportError:
        pass


def main() -> None:
    _install_uvloop()

    from granian import Granian
    from granian.constants import Interfaces, Loops

    from app.config import settings

    server = Granian(
        target="app.lifecycle:create_app",
        factory=True,
        address="0.0.0.0",
        port=8000,
        interface=Interfaces.ASGI,
        loop=Loops.uvloop if sys.platform != "win32" else Loops.asyncio,
        workers=1 if settings.debug else 4,
        log_access=settings.debug,
    )
    server.serve()


if __name__ == "__main__":
    main()
