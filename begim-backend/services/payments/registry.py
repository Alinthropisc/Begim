"""Реестр провайдеров. Добавить новый = одна строка."""
from __future__ import annotations

from models.enums import PaymentProvider as PaymentProviderEnum
from services.payments.base import PaymentProvider
from services.payments.cash import CashProvider
from services.payments.click import ClickProvider
from services.payments.payme import PaymeProvider


def get_provider(provider: PaymentProviderEnum) -> PaymentProvider:
    if provider == PaymentProviderEnum.PAYME:
        return PaymeProvider()
    if provider == PaymentProviderEnum.CLICK:
        return ClickProvider()
    if provider == PaymentProviderEnum.CASH:
        return CashProvider()
    raise ValueError(f"unknown provider: {provider}")
