"""SellerGroup + Contacts + Broadcasts (Lazy Data Stream).

См. API_DOCS.Domain.md §7 для полной схемы.

**Главный инвариант:** broadcast уходит ТОЛЬКО получателям с явным opt-in.
- Для group target — `SellerGroupMember.opt_in_marketing=true` обязателен.
- Для followers/buyers — `User.marketing_opt_in=true`.
- Materialize фильтрует на уровне SQL: тех, кто без opt-in, в `BroadcastDelivery`
  не попадают вовсе. Это снимает риск отправки случайно.
"""

from __future__ import annotations

import secrets
from dataclasses import dataclass, field
from datetime import datetime, timezone, UTC
from typing import Any

from loguru import logger
from sqlalchemy import and_, insert, select, update

from models.broadcast import Broadcast, BroadcastDelivery
from models.enums import (
    BroadcastCta,
    BroadcastDeliveryStatus,
    BroadcastStatus,
    BroadcastTargetType,
    ContactImportStatus,
    GroupMemberSource,
    SellerGroupPrivacy,
)
from models.follow import Follow
from models.order import Order
from models.seller_contact import SellerContact
from models.seller_group import SellerGroup, SellerGroupMember
from models.user import User
from repositories import UnitOfWork
from services.security.phone import hash_phone


class LoyaltyError(Exception):
    pass


class NotFound(LoyaltyError):
    pass


class Forbidden(LoyaltyError):
    pass


class Conflict(LoyaltyError):
    pass


# ----- Groups -----


@dataclass(slots=True)
class GroupCreateInput:
    name: str
    description: str | None = None
    privacy: SellerGroupPrivacy = SellerGroupPrivacy.INVITE_ONLY


class SellerGroupService:
    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def create(self, user_id: int, data: GroupCreateInput) -> SellerGroup:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise Forbidden("only sellers can create groups")
            group = SellerGroup(
                seller_id=seller.id,
                name=data.name.strip(),
                description=data.description,
                privacy=data.privacy,
                invite_slug=secrets.token_urlsafe(8),
            )
            uow.session.add(group)
            await uow.flush()
            return group

    async def list_my(self, user_id: int):
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                return []
            return list(await uow.seller_groups.list_for_seller(seller.id))

    async def join_by_slug(self, user_id: int, slug: str) -> SellerGroupMember:
        async with self._uow_factory() as uow:
            group = await uow.seller_groups.get_by_invite_slug(slug)
            if group is None:
                raise NotFound("group not found")
            existing = await uow.group_members.get_pair(group.id, user_id)
            if existing is not None:
                return existing
            member = SellerGroupMember(
                group_id=group.id,
                user_id=user_id,
                source=GroupMemberSource.INVITE,
                opt_in_marketing=True,  # join по приглашению = осознанный opt-in
                opt_in_at=datetime.now(UTC),
                channels={"telegram_dm": True, "in_app_push": True},
            )
            uow.session.add(member)
            group.members_count = (group.members_count or 0) + 1
            await uow.flush()
            return member


# ----- Contacts -----


@dataclass(slots=True)
class ImportContactInput:
    phone: str
    display_name: str | None = None


@dataclass(slots=True)
class ImportContactsResult:
    imported: int
    matched: int
    skipped: int
    contact_ids: list[int] = field(default_factory=list)


class ContactsService:
    """Импорт контактов продавца с приватным матчингом по `phone_hash`.

    Открытый номер не хранится: на входе считаем hash и забываем оригинал.
    Найденные совпадения (`matched_user_id`) — кандидаты на soft-permission
    приглашение в клуб.
    """

    def __init__(self, uow_factory=UnitOfWork) -> None:
        self._uow_factory = uow_factory

    async def import_contacts(self, user_id: int, items: list[ImportContactInput]) -> ImportContactsResult:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise Forbidden("only sellers can import contacts")

            imported = matched = skipped = 0
            ids: list[int] = []
            for it in items:
                ph = hash_phone(it.phone)
                if ph is None:
                    skipped += 1
                    continue

                existing = await uow.contacts.get_by_phone_hash(seller.id, ph)
                if existing is not None:
                    ids.append(existing.id)
                    continue

                # Матч с существующим User по phone_hash
                user_match = (await uow.session.execute(select(User).where(User.phone_hash == ph).limit(1))).scalar_one_or_none()
                contact = SellerContact(
                    seller_id=seller.id,
                    phone_hash=ph,
                    display_name=it.display_name,
                    matched_user_id=user_match.id if user_match else None,
                    status=ContactImportStatus.PENDING,
                    invite_token=secrets.token_urlsafe(8),
                )
                uow.session.add(contact)
                await uow.flush()
                ids.append(contact.id)
                imported += 1
                if user_match is not None:
                    matched += 1

            return ImportContactsResult(imported=imported, matched=matched, skipped=skipped, contact_ids=ids)

    async def list_my(self, user_id: int, *, offset: int = 0, limit: int = 100):
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise Forbidden("not a seller")
            return await uow.contacts.list_for_seller(seller.id, offset=offset, limit=limit)


# ----- Broadcasts: Strategy для таргета -----


@dataclass(slots=True)
class BroadcastCreateInput:
    title: str
    body: str
    target_type: BroadcastTargetType
    target_ref: str | None = None
    cta_type: BroadcastCta = BroadcastCta.NONE
    cta_product_id: int | None = None
    cta_url: str | None = None
    media: list[dict] | None = None
    scheduled_for: datetime | None = None


class BroadcastTarget:
    """Базовый Strategy: материализовать аудиторию в `broadcast_deliveries`."""

    async def materialize(self, uow: UnitOfWork, broadcast: Broadcast) -> int:
        raise NotImplementedError


class FollowersTarget(BroadcastTarget):
    """Подписчики продавца с глобальным opt-in."""

    async def materialize(self, uow: UnitOfWork, broadcast: Broadcast) -> int:
        stmt = (
            select(User.id)
            .join(Follow, Follow.follower_id == User.id)
            .where(
                Follow.seller_id == broadcast.seller_id,
                User.marketing_opt_in.is_(True),
                User.is_blocked.is_(False),
            )
        )
        user_ids = [r[0] for r in (await uow.session.execute(stmt)).all()]
        return await _bulk_insert_deliveries(uow, broadcast.id, user_ids)


class GroupTarget(BroadcastTarget):
    """Члены конкретной группы с opt-in внутри группы."""

    def __init__(self, group_id: int) -> None:
        self.group_id = group_id

    async def materialize(self, uow: UnitOfWork, broadcast: Broadcast) -> int:
        group = await uow.seller_groups.get_by_id(self.group_id)
        if group is None or group.seller_id != broadcast.seller_id:
            raise NotFound("group not found")
        stmt = (
            select(SellerGroupMember.user_id)
            .join(User, User.id == SellerGroupMember.user_id)
            .where(
                SellerGroupMember.group_id == self.group_id,
                SellerGroupMember.opt_in_marketing.is_(True),
                User.is_blocked.is_(False),
            )
        )
        user_ids = [r[0] for r in (await uow.session.execute(stmt)).all()]
        return await _bulk_insert_deliveries(uow, broadcast.id, user_ids)


class RepeatBuyersTarget(BroadcastTarget):
    """Те, кто сделал ≥2 заказа у продавца. Требуется глобальный opt-in."""

    async def materialize(self, uow: UnitOfWork, broadcast: Broadcast) -> int:
        from sqlalchemy import func

        sub = select(Order.buyer_id, func.count(Order.id).label("cnt")).where(Order.seller_id == broadcast.seller_id).group_by(Order.buyer_id).having(func.count(Order.id) >= 2).subquery()
        stmt = select(User.id).join(sub, sub.c.buyer_id == User.id).where(User.marketing_opt_in.is_(True), User.is_blocked.is_(False))
        user_ids = [r[0] for r in (await uow.session.execute(stmt)).all()]
        return await _bulk_insert_deliveries(uow, broadcast.id, user_ids)


class AllMyCustomersTarget(BroadcastTarget):
    async def materialize(self, uow: UnitOfWork, broadcast: Broadcast) -> int:
        stmt = (
            select(Order.buyer_id)
            .join(User, User.id == Order.buyer_id)
            .where(
                Order.seller_id == broadcast.seller_id,
                User.marketing_opt_in.is_(True),
                User.is_blocked.is_(False),
            )
            .distinct()
        )
        user_ids = [r[0] for r in (await uow.session.execute(stmt)).all()]
        return await _bulk_insert_deliveries(uow, broadcast.id, user_ids)


async def _bulk_insert_deliveries(uow: UnitOfWork, broadcast_id: int, user_ids: list[int]) -> int:
    if not user_ids:
        return 0
    # Большой батч — chunked INSERT, иначе rrисуем MySQL `max_allowed_packet`.
    inserted = 0
    chunk = 500
    for i in range(0, len(user_ids), chunk):
        values = [
            {
                "broadcast_id": broadcast_id,
                "user_id": uid,
                "status": BroadcastDeliveryStatus.QUEUED,
            }
            for uid in user_ids[i : i + chunk]
        ]
        # Используем insert(...).prefix_with("IGNORE") чтобы UNIQUE(broadcast, user)
        # не падал при повторных запусках materialize.
        stmt = insert(BroadcastDelivery).values(values).prefix_with("IGNORE")
        await uow.session.execute(stmt)
        inserted += len(values)
    return inserted


def _make_target_strategy(target_type: BroadcastTargetType, target_ref: str | None) -> BroadcastTarget:
    if target_type == BroadcastTargetType.FOLLOWERS:
        return FollowersTarget()
    if target_type == BroadcastTargetType.GROUP:
        if not target_ref or not target_ref.isdigit():
            raise NotFound("group target_ref required")
        return GroupTarget(int(target_ref))
    if target_type == BroadcastTargetType.REPEAT_BUYERS:
        return RepeatBuyersTarget()
    if target_type == BroadcastTargetType.ALL_MY_CUSTOMERS:
        return AllMyCustomersTarget()
    raise NotFound(f"unsupported target_type: {target_type.value}")


class BroadcastService:
    """Use cases для рассылок."""

    def __init__(self, uow_factory=UnitOfWork, enqueue=None) -> None:
        self._uow_factory = uow_factory
        self._enqueue = enqueue

    async def create_draft(self, user_id: int, data: BroadcastCreateInput) -> Broadcast:
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                raise Forbidden("only sellers can broadcast")
            b = Broadcast(
                seller_id=seller.id,
                target_type=data.target_type,
                target_ref=data.target_ref,
                title=data.title.strip(),
                body=data.body,
                media=data.media or [],
                cta_type=data.cta_type,
                cta_product_id=data.cta_product_id,
                cta_url=data.cta_url,
                scheduled_for=data.scheduled_for,
                status=BroadcastStatus.DRAFT,
            )
            uow.session.add(b)
            await uow.flush()
            return b

    async def list_my(self, user_id: int):
        async with self._uow_factory() as uow:
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None:
                return [], 0
            return await uow.broadcasts.list_for_seller(seller.id)

    async def send(self, user_id: int, broadcast_id: int) -> Broadcast:
        """Материализуем deliveries и кладём первый чанк-job в arq."""
        async with self._uow_factory() as uow:
            broadcast = await uow.broadcasts.get_by_id(broadcast_id)
            if broadcast is None:
                raise NotFound("broadcast not found")
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None or seller.id != broadcast.seller_id:
                raise Forbidden("not your broadcast")
            if broadcast.status not in (BroadcastStatus.DRAFT, BroadcastStatus.QUEUED, BroadcastStatus.FAILED):
                raise Conflict(f"cannot send from status {broadcast.status.value}")

            strategy = _make_target_strategy(broadcast.target_type, broadcast.target_ref)
            count = await strategy.materialize(uow, broadcast)
            broadcast.audience_count = count
            broadcast.status = BroadcastStatus.QUEUED if count > 0 else BroadcastStatus.SENT

            b_id = broadcast.id

        if self._enqueue is not None and count > 0:
            try:
                await self._enqueue("dispatch_broadcast_chunk", {"broadcast_id": b_id})
            except Exception as e:
                logger.warning("enqueue broadcast dispatch failed: {}", e)

        async with self._uow_factory() as uow:
            return await uow.broadcasts.get_by_id(b_id)

    async def cancel(self, user_id: int, broadcast_id: int) -> Broadcast:
        async with self._uow_factory() as uow:
            broadcast = await uow.broadcasts.get_by_id(broadcast_id)
            if broadcast is None:
                raise NotFound("broadcast not found")
            seller = await uow.sellers.get_by_user_id(user_id)
            if seller is None or seller.id != broadcast.seller_id:
                raise Forbidden("not your broadcast")
            if broadcast.status not in (BroadcastStatus.QUEUED, BroadcastStatus.SENDING, BroadcastStatus.DRAFT):
                return broadcast
            broadcast.status = BroadcastStatus.CANCELLED
            # Помечаем все ещё-queued доставки как skipped.
            await uow.session.execute(
                update(BroadcastDelivery)
                .where(
                    BroadcastDelivery.broadcast_id == broadcast_id,
                    BroadcastDelivery.status == BroadcastDeliveryStatus.QUEUED,
                )
                .values(status=BroadcastDeliveryStatus.SKIPPED)
            )
            return broadcast

    async def track_click(self, broadcast_id: int, user_id: int) -> None:
        async with self._uow_factory() as uow:
            now = datetime.now(UTC)
            stmt = (
                update(BroadcastDelivery)
                .where(
                    BroadcastDelivery.broadcast_id == broadcast_id,
                    BroadcastDelivery.user_id == user_id,
                    BroadcastDelivery.clicked_at.is_(None),
                )
                .values(status=BroadcastDeliveryStatus.CLICKED, clicked_at=now)
            )
            result = await uow.session.execute(stmt)
            if result.rowcount:
                b = await uow.broadcasts.get_by_id(broadcast_id)
                if b is not None:
                    b.clicked_count = (b.clicked_count or 0) + 1
