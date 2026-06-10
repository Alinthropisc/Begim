# ⚙️ begim-backend

> **The engine room.** REST API, Telegram bot, background jobs, payments — all in one lean Python service. Do NOT rewrite. Ship on top.

---

## 🛠️ Stack

| Layer | Tech |
|-------|------|
| Framework | **Litestar 2.x** — async-first, OpenAPI built-in |
| Server | **Granian** — Rust-powered ASGI, screaming fast |
| ORM | **SQLAlchemy 2.0 async** + aiomysql |
| Database | **MySQL 8** — InnoDB, utf8mb4, FULLTEXT, JSON |
| Migrations | **Alembic** (autogenerate) |
| Cache / Queue | **Redis 7** + **arq** (async task worker) |
| Bot | **aiogram 3** — polling (dev) / webhook (prod) |
| Auth | Telegram `initData` HMAC + JWT (pyjwt) |
| Payments | Payme · Click (Strategy pattern) |
| Runtime | **Python 3.13** via **uv** |
| Lint | **ruff** |

---

## 🚀 Run

```bash
# Install deps
uv sync

# Copy env
cp .env.example .env   # fill in tokens, DB credentials

# DB setup (one time)
uv run alembic upgrade head
uv run python -m scripts.seed   # cities + categories

# Dev — hot reload + polling bot
uv run python main.py

# Prod — multi-worker Granian
uv run granian --interface asgi --factory app.lifecycle:create_app \
  --host 0.0.0.0 --port 8000 --workers 4 --loop uvloop

# Background worker (separate process)
uv run arq worker.main.WorkerSettings
```

Health → `http://localhost:8000/health`

---

## 🗂️ Structure

```
begim-backend/
├── app/
│   ├── lifecycle.py        # startup/shutdown — DB, Redis, arq, bot
│   ├── controllers/        # Litestar route handlers
│   ├── middleware/         # auth, CORS, rate-limit
│   └── config.py           # pydantic-settings
├── models/                 # SQLAlchemy ORM models
├── schemas/                # Pydantic DTOs (request / response)
├── repositories/           # BaseRepository[T] + per-entity
├── services/               # Business logic — HTTP-agnostic
│   ├── auth.py
│   ├── orders.py
│   ├── products.py
│   ├── reviews.py
│   ├── loyalty.py
│   └── payments/
├── routes/                 # Router aggregator
├── bot/                    # aiogram handlers + FSM
├── worker/                 # arq tasks (stories TTL, broadcasts, payments)
├── database/               # engine, session.py, Alembic env + versions
├── i18n/                   # translator + JSON locales (uz / ru / en)
├── scripts/                # seed, one-off utilities
├── tests/
└── main.py                 # entrypoint
```

---

## 🔑 Key Environment Variables

```env
SECRET_KEY=<32+ chars>
DATABASE_URL=mysql+aiomysql://user:pass@localhost:3306/begim?charset=utf8mb4
REDIS_URL=redis://localhost:6379/0
TELEGRAM_BOT_TOKEN=...
MINI_APP_URL=https://<cf-tunnel>.trycloudflare.com   # changes every CF session!
BOOTSTRAP_ADMIN_TG_IDS=[123456789]
```

Full list → [`.env.example`](./.env.example)

---

## 🗃️ Domain Models

`products` · `orders` · `categories` · `cities` · `sellers`
`reviews` · `community` · `notifications` · `broadcast`
`follow` · `channel_post` · `loyalty`

---

## 🧪 Tests

```bash
uv run pytest
uv run pytest --cov=. --cov-report=term-missing
```

---

## 📡 API Docs

- OpenAPI UI → `http://localhost:8000/schema/swagger`
- Reference → [`API.md`](./API.md)
- Domain glossary → [`API_DOCS.Domain.md`](./API_DOCS.Domain.md)

---

> Part of the [Begim monorepo](../README.md)
