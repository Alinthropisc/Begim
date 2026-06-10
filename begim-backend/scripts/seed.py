"""Seed справочников: Коканд + базовые категории.

Запуск:
    uv run python -m scripts.seed
Идемпотентно — повторный запуск не дублирует записи.
"""

from __future__ import annotations

import asyncio
from datetime import datetime, timezone, UTC

from sqlalchemy import select

from database import db_session, dispose_db, init_db
from models.category import Category
from models.city import City
from models.enums import ProductStatus, SellerVerification, UserRole
from models.product import Product
from models.product_photo import ProductPhoto
from models.seller_profile import SellerProfile
from models.user import User


CITIES: list[dict] = [
    dict(slug="kokand", name_uz="Qoʻqon", name_ru="Коканд", name_en="Kokand", region="Fergana Region", is_active=True, sort_order=10),
    dict(slug="namangan", name_uz="Namangan", name_ru="Наманган", name_en="Namangan", region="Namangan Region", is_active=False, sort_order=20),
    dict(slug="andijan", name_uz="Andijon", name_ru="Андижан", name_en="Andijan", region="Andijan Region", is_active=False, sort_order=30),
    dict(slug="fergana", name_uz="Fargʻona", name_ru="Фергана", name_en="Fergana", region="Fergana Region", is_active=False, sort_order=40),
    dict(slug="tashkent", name_uz="Toshkent", name_ru="Ташкент", name_en="Tashkent", region="Tashkent", is_active=False, sort_order=100),
]


# Двухуровневое дерево: (parent_slug | None, slug, uz, ru, en, icon)
CATEGORIES: list[tuple[str | None, str, str, str, str, str | None]] = [
    (None, "cakes", "Tortlar", "Торты", "Cakes", "🎂"),
    ("cakes", "bento-cakes", "Bento tortlar", "Бенто-торты", "Bento cakes", None),
    ("cakes", "wedding-cakes", "Toʻy tortlari", "Свадебные торты", "Wedding cakes", None),
    (None, "pastries", "Shirinliklar", "Выпечка", "Pastries", "🥐"),
    ("pastries", "cookies", "Pechenelar", "Печенье", "Cookies", None),
    ("pastries", "cupcakes", "Kapkeyklar", "Капкейки", "Cupcakes", None),
    (None, "national-sweets", "Milliy shirinliklar", "Национальные сладости", "National sweets", "🍯"),
    ("national-sweets", "chakchak", "Chak-chak", "Чак-чак", "Chak-chak", None),
    ("national-sweets", "halva", "Halva", "Халва", "Halva", None),
    (None, "bread", "Non", "Хлеб и лепёшки", "Bread", "🥖"),
    (None, "diet", "Dietik", "Диетическое", "Diet & healthy", "🥗"),
]


async def upsert_cities() -> None:
    async with db_session() as session:
        existing = {c.slug for c in (await session.execute(select(City))).scalars().all()}
        added = 0
        for row in CITIES:
            if row["slug"] in existing:
                continue
            session.add(City(**row))
            added += 1
        print(f"cities: added {added}")


async def upsert_categories() -> None:
    async with db_session() as session:
        existing = {c.slug: c for c in (await session.execute(select(Category))).scalars().all()}
        added = 0

        # Корни в первой проходке.
        for parent_slug, slug, uz, ru, en, icon in CATEGORIES:
            if parent_slug is not None:
                continue
            if slug in existing:
                continue
            session.add(Category(slug=slug, name_uz=uz, name_ru=ru, name_en=en, icon=icon, sort_order=added))
            added += 1
        await session.flush()
        existing = {c.slug: c for c in (await session.execute(select(Category))).scalars().all()}

        # Потомки.
        for parent_slug, slug, uz, ru, en, icon in CATEGORIES:
            if parent_slug is None:
                continue
            if slug in existing:
                continue
            parent = existing.get(parent_slug)
            if parent is None:
                print(f"WARN: parent {parent_slug!r} missing for {slug!r}")
                continue
            session.add(Category(slug=slug, name_uz=uz, name_ru=ru, name_en=en, icon=icon, parent_id=parent.id))
            added += 1
        print(f"categories: total added {added}")


# ── Тестовые продавцы и товары (для демо каталога) ──────────────────────────

# (tg_id, username, brand_name, slug, avatar_url, display_name)
SELLERS: list[tuple[int, str, str, str, str, str]] = [
    (90000001, "dilnoza_opa", "Dilnoza opa", "dilnoza-opa", "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80", "Dilnoza"),
    (90000002, "gulnora_xola", "Gulnora xola", "gulnora-xola", "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80", "Gulnora"),
    (90000003, "malika_baker", "Malika", "malika-baker", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80", "Malika"),
]

# (seller_slug, category_slug, title, description, price_sum, photo_url, tags)
PRODUCTS: list[tuple[str, str, str, str, int, str, list[str]]] = [
    ("dilnoza-opa", "cakes", "Medovik torti", "Klassik medovik — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem.", 180_000, "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80", ["halal"]),
    ("dilnoza-opa", "bento-cakes", "Bento tort", "Kichik bento-tort — shaxsiy tabrik uchun ideal.", 90_000, "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&q=80", ["halal", "custom"]),
    ("gulnora-xola", "chakchak", "Chak-chak", "Milliy shirinlik — asal bilan shakllangan qizartirilgan xamir.", 95_000, "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80", ["halal"]),
    ("gulnora-xola", "halva", "Yong'oqli halva", "An'anaviy yong'oqli halva, uy sharoitida tayyorlangan.", 70_000, "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80", ["halal"]),
    ("malika-baker", "cookies", "Pechenye assorti", "Uy pechenyesi to'plami — choy uchun mukammal.", 55_000, "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80", ["halal"]),
    ("malika-baker", "cupcakes", "Kapkeyklar (6 dona)", "Yumshoq kapkeyklar krem bilan — 6 dona to'plam.", 85_000, "https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=800&q=80", ["halal"]),
    ("malika-baker", "cakes", "Tug'ilgan kun torti", "Bayram torti — buyurtma bo'yicha bezatiladi.", 250_000, "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&q=80", ["halal", "custom"]),
]


async def upsert_sellers() -> None:
    """Создаёт тестовых продавцов (User role=seller + verified SellerProfile)."""
    async with db_session() as session:
        active_city = (await session.execute(select(City).where(City.slug == "kokand"))).scalar_one_or_none()
        city_id = active_city.id if active_city else None

        existing = {s.slug for s in (await session.execute(select(SellerProfile))).scalars().all()}
        added = 0
        for tg_id, username, brand, slug, avatar, display in SELLERS:
            if slug in existing:
                continue
            user = User(
                tg_id=tg_id,
                tg_username=username,
                tg_first_name=display,
                display_name=display,
                role=UserRole.SELLER,
                city_id=city_id,
            )
            user.seller_profile = SellerProfile(
                brand_name=brand,
                slug=slug,
                avatar_url=avatar,
                city_id=city_id,
                verification=SellerVerification.VERIFIED,
            )
            session.add(user)
            added += 1
        print(f"sellers: added {added}")


async def upsert_products() -> None:
    """Создаёт опубликованные товары с фото у тестовых продавцов."""
    async with db_session() as session:
        sellers = {s.slug: s for s in (await session.execute(select(SellerProfile))).scalars().all()}
        cats = {c.slug: c for c in (await session.execute(select(Category))).scalars().all()}
        existing_titles = {t for (t,) in (await session.execute(select(Product.title))).all()}
        now = datetime.now(UTC)
        added = 0
        for seller_slug, cat_slug, title, desc, price_sum, photo, tags in PRODUCTS:
            if title in existing_titles:
                continue
            seller = sellers.get(seller_slug)
            if seller is None:
                print(f"WARN: seller {seller_slug!r} missing for {title!r}")
                continue
            category = cats.get(cat_slug)
            product = Product(
                seller_id=seller.id,
                category_id=category.id if category else None,
                city_id=seller.city_id,
                title=title,
                description=desc,
                price_minor=price_sum * 100,  # сумы → тийины
                tags=tags,
                status=ProductStatus.PUBLISHED,
                published_at=now,
            )
            product.photos = [ProductPhoto(url=photo, sort_order=0)]
            session.add(product)
            added += 1

        # Денормализованный счётчик товаров у продавца.
        await session.flush()
        for seller in sellers.values():
            cnt = len([p for p in PRODUCTS if p[0] == seller.slug])
            if cnt:
                seller.products_count = cnt
        print(f"products: added {added}")


async def main() -> None:
    await init_db()
    try:
        await upsert_cities()
        await upsert_categories()
        await upsert_sellers()
        await upsert_products()
    finally:
        await dispose_db()


if __name__ == "__main__":
    asyncio.run(main())
