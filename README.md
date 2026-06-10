# 🧁 BEGIM — Homemade Sweets Marketplace

> **The platform where home bakers become entrepreneurs.**
> Built for Uzbekistan. Powered by Telegram. No middlemen.

```
  ██████╗ ███████╗ ██████╗ ██╗███╗   ███╗
  ██╔══██╗██╔════╝██╔════╝ ██║████╗ ████║
  ██████╔╝█████╗  ██║  ███╗██║██╔████╔██║
  ██╔══██╗██╔══╝  ██║   ██║██║██║╚██╔╝██║
  ██████╔╝███████╗╚██████╔╝██║██║ ╚═╝ ██║
  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝╚═╝     ╚═╝
```

---

## 🗺️ Monorepo Map

| Module | What it does | Stack | Port |
|--------|-------------|-------|------|
| [`begim-backend`](./begim-backend) | REST API + bot brain | Python · Litestar · MySQL · Redis | `8000` |
| [`begim-miniapp`](./begim-miniapp) | Telegram Mini App | React · Vite · TypeScript | `5174` |
| [`begim-frontend`](./begim-frontend) | Public website + shop | React · Vite · TypeScript | `5173` |
| [`begim-admin`](./begim-admin) | Back-office dashboard | React · Vite · TypeScript | `5175` |
| [`begim-shared`](./begim-shared) | Shared API client & types | TypeScript (zero deps) | — |
| [`begim-mobile`](./begim-mobile) | Native mobile app | Flutter · Dart | — |

---

## ⚡ Quick Start

### Prerequisites

```bash
mysql -u root -p             # MySQL 8+
redis-server --daemonize yes # Redis
```

### Backend

```bash
cd begim-backend
uv run python main.py        # dev mode — hot reload + polling bot
```

### Mini App (Telegram)

```bash
cd begim-miniapp
npm run dev                  # → http://localhost:5174

# Expose via HTTPS for Telegram (new URL each session)
cloudflared tunnel --url http://localhost:5174
```

### Full Stack

```bash
# [1] Backend
cd begim-backend && uv run python main.py

# [2] Mini App
cd begim-miniapp && npm run dev

# [3] Tunnels (run both, grab the URLs)
cloudflared tunnel --url http://localhost:8000 &
cloudflared tunnel --url http://localhost:5174
```

> 🔁 After new tunnel URLs → update `begim-backend/.env` → `MINI_APP_URL`
> and update bot Menu Button URL in BotFather.

---

## 🏗️ Architecture

```
Telegram Client
      │
      ├── Bot (polling) ─────────────► begim-backend :8000
      │                                      │
      └── Mini App (WebApp) ◄── CF Tunnel    ├── MySQL  (products, orders, users)
               │                             ├── Redis  (cache + arq queue)
               └── @begim/shared             └── arq    (background jobs)

begim-frontend  ──┐
begim-admin     ──┼── @begim/shared ──► begim-backend API
begim-mobile    ──┘
```

---

## 🤖 Bot

**Handle:** `@Beegimbot` · **Mode:** polling (dev) / webhook (prod)

```bash
# Bot silent? Nuke the webhook:
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=true"
```

---

## 🌍 What We're Building

Begim connects home bakers across Uzbekistan with customers who want **real food, made by real people**.

- 🏘️ City-based seller discovery
- ⭐ Community reviews & stories
- 📦 Full order management
- 💳 Payme & Click payments
- 🏆 Seller loyalty program
- 📱 Telegram-native UX

---

> Built with 🔥 by Alinthrop/sc · Uzbekistan · 2024–2026
