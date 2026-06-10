"""Repositories для loyalty: SellerGroup, Member, Contact, Broadcast, Delivery."""

from __future__ import annotations

from sqlalchemy import desc, select

from models.broadcast import Broadcast, BroadcastDelivery
from models.seller_contact import SellerContact
from models.seller_group import SellerGroup, SellerGroupMember
from repositories.base_repository import BaseRepository


class SellerGroupRepository(BaseRepository[SellerGroup]):
    model = SellerGroup

    async def list_for_seller(self, seller_id: int):
        stmt = select(SellerGroup).where(SellerGroup.seller_id == seller_id, SellerGroup.is_deleted.is_(False)).order_by(desc(SellerGroup.id))
        return (await self.session.execute(stmt)).scalars().all()

    async def get_by_invite_slug(self, slug: str) -> SellerGroup | None:
        stmt = select(SellerGroup).where(SellerGroup.invite_slug == slug)
        return (await self.session.execute(stmt)).scalar_one_or_none()


class SellerGroupMemberRepository(BaseRepository[SellerGroupMember]):
    model = SellerGroupMember

    async def get_pair(self, group_id: int, user_id: int) -> SellerGroupMember | None:
        stmt = select(SellerGroupMember).where(
            SellerGroupMember.group_id == group_id,
            SellerGroupMember.user_id == user_id,
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_in_group(self, group_id: int, offset: int = 0, limit: int = 50):
        from sqlalchemy import func

        cond = [SellerGroupMember.group_id == group_id]
        items = (await self.session.execute(select(SellerGroupMember).where(*cond).order_by(desc(SellerGroupMember.id)).offset(offset).limit(limit))).scalars().all()
        total = int((await self.session.execute(select(func.count(SellerGroupMember.id)).where(*cond))).scalar_one())
        return items, total


class SellerContactRepository(BaseRepository[SellerContact]):
    model = SellerContact

    async def get_by_phone_hash(self, seller_id: int, phone_hash: str) -> SellerContact | None:
        stmt = select(SellerContact).where(
            SellerContact.seller_id == seller_id,
            SellerContact.phone_hash == phone_hash,
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def list_for_seller(self, seller_id: int, offset: int = 0, limit: int = 100):
        from sqlalchemy import func

        cond = [SellerContact.seller_id == seller_id]
        items = (await self.session.execute(select(SellerContact).where(*cond).order_by(desc(SellerContact.id)).offset(offset).limit(limit))).scalars().all()
        total = int((await self.session.execute(select(func.count(SellerContact.id)).where(*cond))).scalar_one())
        return items, total


class BroadcastRepository(BaseRepository[Broadcast]):
    model = Broadcast

    async def list_for_seller(self, seller_id: int, offset: int = 0, limit: int = 30):
        from sqlalchemy import func

        cond = [Broadcast.seller_id == seller_id]
        items = (await self.session.execute(select(Broadcast).where(*cond).order_by(desc(Broadcast.id)).offset(offset).limit(limit))).scalars().all()
        total = int((await self.session.execute(select(func.count(Broadcast.id)).where(*cond))).scalar_one())
        return items, total


class BroadcastDeliveryRepository(BaseRepository[BroadcastDelivery]):
    model = BroadcastDelivery
