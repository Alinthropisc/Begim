"""Тесты конечного автомата заказов: TRANSITIONS / _can_transition. Без БД."""

import pytest

from models.enums import OrderStatus, UserRole
from services.orders import FINAL_STATUSES, _can_transition


class TestSellerTransitions:
    @pytest.mark.parametrize(
        "frm,to",
        [
            (OrderStatus.NEW, OrderStatus.ACCEPTED),
            (OrderStatus.NEW, OrderStatus.CANCELLED),
            (OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS),
            (OrderStatus.ACCEPTED, OrderStatus.CANCELLED),
            (OrderStatus.IN_PROGRESS, OrderStatus.READY),
            (OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY),
            (OrderStatus.READY, OrderStatus.DELIVERED),
            (OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED),
        ],
    )
    def test_allowed(self, frm, to):
        assert _can_transition(UserRole.SELLER, frm, to) is True

    @pytest.mark.parametrize(
        "frm,to",
        [
            (OrderStatus.NEW, OrderStatus.IN_PROGRESS),  # нельзя перепрыгнуть
            (OrderStatus.NEW, OrderStatus.DELIVERED),
            (OrderStatus.ACCEPTED, OrderStatus.READY),
            (OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED),  # уже в пути — не отменить
        ],
    )
    def test_forbidden(self, frm, to):
        assert _can_transition(UserRole.SELLER, frm, to) is False


class TestCustomerTransitions:
    def test_can_cancel_new(self):
        assert _can_transition(UserRole.CUSTOMER, OrderStatus.NEW, OrderStatus.CANCELLED) is True

    @pytest.mark.parametrize("to", [OrderStatus.ACCEPTED, OrderStatus.IN_PROGRESS, OrderStatus.DELIVERED])
    def test_cannot_advance(self, to):
        assert _can_transition(UserRole.CUSTOMER, OrderStatus.NEW, to) is False

    def test_cannot_touch_accepted(self):
        # после принятия продавцом покупатель не может ничего
        assert _can_transition(UserRole.CUSTOMER, OrderStatus.ACCEPTED, OrderStatus.CANCELLED) is False


class TestAdminTransitions:
    def test_admin_can_set_any_non_same(self):
        assert _can_transition(UserRole.ADMIN, OrderStatus.NEW, OrderStatus.DELIVERED) is True
        assert _can_transition(UserRole.ADMIN, OrderStatus.ACCEPTED, OrderStatus.CANCELLED) is True

    def test_admin_cannot_noop_same_status(self):
        assert _can_transition(UserRole.ADMIN, OrderStatus.NEW, OrderStatus.NEW) is False


class TestFinalStatuses:
    def test_final_set_contents(self):
        assert FINAL_STATUSES == frozenset({OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED})

    @pytest.mark.parametrize("role", [UserRole.SELLER, UserRole.CUSTOMER, UserRole.ADMIN])
    @pytest.mark.parametrize("final", [OrderStatus.DELIVERED, OrderStatus.CANCELLED, OrderStatus.REFUNDED])
    def test_no_transition_out_of_final(self, role, final):
        # из любого финального статуса никто никуда не уходит
        for to in OrderStatus:
            assert _can_transition(role, final, to) is False
