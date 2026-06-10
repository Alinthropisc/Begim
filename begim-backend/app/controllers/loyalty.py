"""Контроллеры loyalty: группы, контакты, broadcasts."""

from litestar import Controller, Response, get, post
from litestar.di import Provide
from litestar.exceptions import (
    ClientException,
    NotFoundException,
    PermissionDeniedException,
)
from litestar.params import Parameter

from app.config import settings
from app.lifecycle import get_arq
from models.user import User
from schemas.loyalty import (
    BroadcastCreateIn,
    BroadcastOut,
    ContactImportIn,
    ContactImportSummary,
    ContactOut,
    GroupCreateIn,
    GroupOut,
)
from services.loyalty import (
    BroadcastCreateInput,
    BroadcastService,
    Conflict,
    ContactsService,
    Forbidden,
    GroupCreateInput,
    ImportContactInput,
    NotFound,
    SellerGroupService,
)


async def _enqueue_arq(name: str, payload: dict) -> None:
    arq = get_arq()
    await arq.enqueue_job(name, payload)


def _group_svc(): return SellerGroupService()
def _contacts_svc(): return ContactsService()
def _broadcast_svc(): return BroadcastService(enqueue=_enqueue_arq)


# ----- Groups -----

class SellerGroupsController(Controller):
    path = settings.api_prefix + "/seller/groups"
    tags = ["loyalty-groups"]
    dependencies = {"svc": Provide(_group_svc, sync_to_thread=False)}

    @get("/")
    async def list_my(self, current_user: User, svc: SellerGroupService) -> list[GroupOut]:
        groups = await svc.list_my(current_user.id)
        return [GroupOut.model_validate(g) for g in groups]

    @post("/", status_code=201)
    async def create(self, data: GroupCreateIn, current_user: User, svc: SellerGroupService) -> GroupOut:
        try:
            g = await svc.create(current_user.id, GroupCreateInput(**data.model_dump()))
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return GroupOut.model_validate(g)


class GroupJoinController(Controller):
    path = settings.api_prefix + "/groups"
    tags = ["loyalty-groups"]
    dependencies = {"svc": Provide(_group_svc, sync_to_thread=False)}

    @post("/join/{invite_slug:str}")
    async def join(
        self, invite_slug: str, current_user: User, svc: SellerGroupService
    ) -> dict:
        try:
            member = await svc.join_by_slug(current_user.id, invite_slug)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        return {"joined": True, "group_id": member.group_id}


# ----- Contacts -----

class ContactsController(Controller):
    path = settings.api_prefix + "/seller/contacts"
    tags = ["loyalty-contacts"]
    dependencies = {"svc": Provide(_contacts_svc, sync_to_thread=False)}

    @post("/import")
    async def import_(self, data: ContactImportIn, current_user: User, svc: ContactsService) -> ContactImportSummary:
        try:
            result = await svc.import_contacts(
                current_user.id,
                [ImportContactInput(phone=i.phone, display_name=i.display_name) for i in data.contacts],
            )
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return ContactImportSummary(
            imported=result.imported,
            matched=result.matched,
            skipped=result.skipped,
            contact_ids=result.contact_ids,
        )

    @get("/")
    async def list_my(
        self,
        current_user: User,
        svc: ContactsService,
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=100),
    ) -> list[ContactOut]:
        try:
            items, _ = await svc.list_my(current_user.id, offset=offset, limit=limit)
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return [ContactOut.model_validate(c) for c in items]


# ----- Broadcasts -----

class BroadcastsController(Controller):
    path = settings.api_prefix + "/seller/broadcasts"
    tags = ["loyalty-broadcasts"]
    dependencies = {"svc": Provide(_broadcast_svc, sync_to_thread=False)}

    @get("/")
    async def list_my(self, current_user: User, svc: BroadcastService) -> list[BroadcastOut]:
        items, _ = await svc.list_my(current_user.id)
        return [BroadcastOut.model_validate(b) for b in items]

    @post("/", status_code=201)
    async def create(
        self, data: BroadcastCreateIn, current_user: User, svc: BroadcastService
    ) -> BroadcastOut:
        try:
            b = await svc.create_draft(current_user.id, BroadcastCreateInput(**data.model_dump()))
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return BroadcastOut.model_validate(b)

    @post("/{broadcast_id:int}/send")
    async def send(
        self, broadcast_id: int, current_user: User, svc: BroadcastService
    ) -> BroadcastOut:
        try:
            b = await svc.send(current_user.id, broadcast_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        except Conflict as e:
            raise ClientException(detail=str(e)) from e
        return BroadcastOut.model_validate(b)

    @post("/{broadcast_id:int}/cancel")
    async def cancel(
        self, broadcast_id: int, current_user: User, svc: BroadcastService
    ) -> BroadcastOut:
        try:
            b = await svc.cancel(current_user.id, broadcast_id)
        except NotFound as e:
            raise NotFoundException(detail=str(e)) from e
        except Forbidden as e:
            raise PermissionDeniedException(detail=str(e)) from e
        return BroadcastOut.model_validate(b)


class BroadcastTrackController(Controller):
    """Публичный (требует JWT) трекинг кликов из Mini App."""

    path = settings.api_prefix + "/broadcasts"
    tags = ["loyalty-broadcasts"]
    dependencies = {"svc": Provide(_broadcast_svc, sync_to_thread=False)}

    @post("/{broadcast_id:int}/track/click", status_code=204)
    async def click(
        self, broadcast_id: int, current_user: User, svc: BroadcastService
    ) -> None:
        await svc.track_click(broadcast_id, current_user.id)
