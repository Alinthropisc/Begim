"""Admin endpoints. Защита: проверяем role=admin в каждом handler'е."""
from __future__ import annotations

from datetime import datetime, timezone, UTC

from litestar import Controller, get, patch, post
from litestar.exceptions import NotFoundException
from litestar.params import Parameter

from app.config import settings
from app.dependencies import ensure_admin
from models.city import City
from models.category import Category
from models.enums import OrderStatus, ProductStatus, SellerVerification
from models.user import User
from repositories import UnitOfWork


class AdminController(Controller):
    path = settings.api_prefix + "/admin"
    tags = ["admin"]

    # ----- dashboard -----

    @get("/dashboard")
    async def dashboard(self, current_user: User) -> dict:
        ensure_admin(current_user)
        from sqlalchemy import func, select

        from models.order import Order
        from models.product import Product
        from models.seller_profile import SellerProfile

        async with UnitOfWork() as uow:
            counts = {}
            counts["users"] = int((await uow.session.execute(select(func.count(User.id)))).scalar_one())
            counts["sellers"] = int((await uow.session.execute(select(func.count(SellerProfile.id)))).scalar_one())
            counts["products_published"] = int((await uow.session.execute(
                select(func.count(Product.id)).where(Product.status == ProductStatus.PUBLISHED)
            )).scalar_one())
            counts["orders_today"] = int((await uow.session.execute(
                select(func.count(Order.id)).where(
                    Order.created_at >= datetime.now(UTC).replace(hour=0, minute=0, second=0, microsecond=0)
                )
            )).scalar_one())
        return counts

    # ----- sellers moderation -----

    @get("/sellers")
    async def list_sellers(
        self,
        current_user: User,
        verification: SellerVerification | None = Parameter(query="verification", default=None),
        offset: int = Parameter(query="offset", default=0),
        limit: int = Parameter(query="limit", default=30),
    ) -> dict:
        ensure_admin(current_user)
        from sqlalchemy import desc, func, select

        from models.seller_profile import SellerProfile

        cond = []
        if verification is not None:
            cond.append(SellerProfile.verification == verification)
        async with UnitOfWork() as uow:
            items = (
                await uow.session.execute(
                    select(SellerProfile).where(*cond)
                    .order_by(desc(SellerProfile.id)).offset(offset).limit(min(max(limit, 1), 100))
                )
            ).scalars().all()
            total = int((await uow.session.execute(select(func.count(SellerProfile.id)).where(*cond))).scalar_one())
            return {
                "items": [
                    {
                        "id": s.id,
                        "brand_name": s.brand_name,
                        "slug": s.slug,
                        "verification": s.verification.value,
                        "rating_avg": float(s.rating_avg or 0),
                        "products_count": s.products_count,
                        "orders_completed": s.orders_completed,
                    }
                    for s in items
                ],
                "total": total, "offset": offset, "limit": limit,
            }

    @post("/sellers/{seller_id:int}/verify")
    async def verify_seller(self, seller_id: int, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            s = await uow.sellers.get_by_id(seller_id)
            if s is None:
                raise NotFoundException(detail="seller not found")
            s.verification = SellerVerification.VERIFIED
            return {"id": s.id, "verification": s.verification.value}

    @post("/sellers/{seller_id:int}/reject")
    async def reject_seller(self, seller_id: int, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            s = await uow.sellers.get_by_id(seller_id)
            if s is None:
                raise NotFoundException(detail="seller not found")
            s.verification = SellerVerification.REJECTED
            return {"id": s.id, "verification": s.verification.value}

    # ----- products moderation -----

    @post("/products/{product_id:int}/block")
    async def block_product(self, product_id: int, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            p = await uow.products.get_by_id(product_id)
            if p is None:
                raise NotFoundException(detail="product not found")
            p.status = ProductStatus.BLOCKED
            return {"id": p.id, "status": p.status.value}

    @post("/products/{product_id:int}/unblock")
    async def unblock_product(self, product_id: int, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            p = await uow.products.get_by_id(product_id)
            if p is None:
                raise NotFoundException(detail="product not found")
            p.status = ProductStatus.PUBLISHED if p.published_at else ProductStatus.DRAFT
            return {"id": p.id, "status": p.status.value}

    # ----- cities -----

    @post("/cities", status_code=201)
    async def add_city(self, data: dict, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            city = City(
                slug=data["slug"],
                name_uz=data["name_uz"],
                name_ru=data["name_ru"],
                name_en=data["name_en"],
                region=data.get("region"),
                is_active=bool(data.get("is_active", False)),
                sort_order=int(data.get("sort_order", 0)),
            )
            uow.session.add(city)
            await uow.flush()
            return {"id": city.id, "slug": city.slug, "is_active": city.is_active}

    @patch("/cities/{city_id:int}")
    async def update_city(self, city_id: int, data: dict, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            city = await uow.cities.get_by_id(city_id)
            if city is None:
                raise NotFoundException(detail="city not found")
            for key in ("name_uz", "name_ru", "name_en", "region", "is_active", "sort_order"):
                if key in data:
                    setattr(city, key, data[key])
            return {"id": city.id, "slug": city.slug, "is_active": city.is_active}

    # ----- categories -----

    @post("/categories", status_code=201)
    async def add_category(self, data: dict, current_user: User) -> dict:
        ensure_admin(current_user)
        async with UnitOfWork() as uow:
            cat = Category(
                slug=data["slug"],
                name_uz=data["name_uz"],
                name_ru=data["name_ru"],
                name_en=data["name_en"],
                icon=data.get("icon"),
                parent_id=data.get("parent_id"),
                sort_order=int(data.get("sort_order", 0)),
            )
            uow.session.add(cat)
            await uow.flush()
            return {"id": cat.id, "slug": cat.slug}
