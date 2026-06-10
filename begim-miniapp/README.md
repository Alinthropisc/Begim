# 📱 begim-miniapp

> **Telegram-native storefront.** Opens inside the Telegram app — no installs, no friction, just sweets.

---

## 🛠️ Stack

| | |
|--|--|
| Framework | **React 18** + **TypeScript** |
| Bundler | **Vite 5** |
| Styling | **Tailwind CSS 4** |
| Routing | **react-router-dom 6** |
| State | **Zustand** |
| TG SDK | **@telegram-apps/sdk-react** |
| HTTP | **@begim/shared** (zero-dep API client) |
| Port | **5174** |

---

## 🚀 Run

```bash
npm install
npm run dev          # → http://localhost:5174

# Expose via HTTPS so Telegram can load it
cloudflared tunnel --url http://localhost:5174
```

> 🔁 After each tunnel restart: update `begim-backend/.env` → `MINI_APP_URL`
> and the bot Menu Button in BotFather.

---

## 🗂️ Structure

```
begim-miniapp/
├── src/
│   ├── main.tsx            # entry — TelegramProvider wrap
│   ├── App.tsx             # router + auth gate
│   ├── config.ts           # VITE_API_URL
│   ├── i18n.ts             # uz / ru / en strings
│   ├── components/
│   │   ├── StoriesBar.tsx      # 24h story feed
│   │   ├── StoryViewer.tsx     # full-screen story viewer
│   │   ├── CommunityView.tsx   # recipe / post feed
│   │   ├── CommunityPost.tsx   # single post card
│   │   └── TelegramBanner.tsx  # channel promo banner
│   ├── data/               # mock data (pre-API integration)
│   ├── hooks/              # useTelegram, useCart, etc.
│   └── utils/              # cn(), formatters
├── index.html              # Telegram WebApp SDK + viewport meta
├── vite.config.ts          # port 5174, allowedHosts: true, @begim/shared alias
└── package.json
```

---

## 🤖 Telegram Integration

```ts
// Auth fires automatically on mount
import { ensureSession } from '@begim/shared';
await ensureSession();   // loginWithTelegram(initData) under the hood

// Native Telegram UI elements
import { useMainButton, useBackButton } from '@telegram-apps/sdk-react';
```

Telegram features wired in:
- 🎯 **MainButton** — checkout / confirm actions
- ◀️ **BackButton** — in-app navigation
- 🌓 **ThemeParams** — auto dark / light theme sync
- 📳 **HapticFeedback** — tap feedback
- 📐 **Viewport** — `--tg-viewport-height`, no `overflow:hidden` (scroll fixed)

---

## 🔌 API Connection

```ts
// src/main.tsx
configureApi({
  baseUrl: import.meta.env.VITE_API_URL,
  getInitData: () => window.Telegram?.WebApp?.initData ?? '',
});
```

`.env.local`:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🏗️ Build

```bash
npm run build   # → dist/
```

---

> Part of the [Begim monorepo](../README.md)
