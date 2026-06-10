"""Хэш телефона для матчинга, без хранения открытого номера.

Алгоритм: нормализация в E.164 → `sha256(SECRET_KEY + e164)` → hex.
SECRET_KEY служит «солью»: одинаковый телефон в разных инсталляциях даёт
разный хэш, что усложняет offline rainbow-атаки.
"""
from __future__ import annotations

import hashlib
import re

from app.config import settings


_PHONE_CLEAN = re.compile(r"[^\d+]")


def normalize_e164(raw: str, default_cc: str = "+998") -> str | None:
    """Грубая нормализация для UZ-номеров. Возвращает '+998XXXXXXXXX' или None."""
    if not raw:
        return None
    s = _PHONE_CLEAN.sub("", raw.strip())
    if not s:
        return None
    if s.startswith("+"):
        return s
    if s.startswith("998"):
        return "+" + s
    if s.startswith("00"):
        return "+" + s[2:]
    # 9 цифр (UZ mobile без кода) → +998
    digits = re.sub(r"\D", "", s)
    if len(digits) == 9:
        return f"{default_cc}{digits}"
    if len(digits) == 12 and digits.startswith("998"):
        return f"+{digits}"
    return None


def hash_phone(raw: str) -> str | None:
    """Нормализовать + захэшировать. None — если не получилось нормализовать."""
    e164 = normalize_e164(raw)
    if e164 is None:
        return None
    data = (settings.secret_key + e164).encode("utf-8")
    return hashlib.sha256(data).hexdigest()
