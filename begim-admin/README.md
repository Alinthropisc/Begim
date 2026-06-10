# 🖥️ begim-admin

> **Mission control.** Full back-office dashboard for managing products, orders, sellers, analytics, and community.

---

## 🛠️ Stack

| | |
|--|--|
| Framework | **React 18** + **TypeScript** |
| Bundler | **Vite 5** |
| Styling | **Tailwind CSS 4** |
| Routing | **react-router-dom 6** |
| HTTP | **@begim/shared** `admin.ts` endpoints |
| Access | `role=admin` JWT required |
| Port | **5175** |

---

## 🚀 Run

```bash
npm install
npm run dev    # → http://localhost:5175
```

Login requires a Telegram account listed in `BOOTSTRAP_ADMIN_TG_IDS` in backend `.env`.

---

## 🗂️ Structure

```
begim-admin/
├── src/
│   ├── main.tsx
│   ├── App.tsx             # admin router
│   ├── config.ts
│   ├── data/               # mock data (pre-API)
│   ├── assets/
│   └── admin/
│       ├── AdminApp.tsx    # layout wrapper
│       ├── components/
│       │   ├── Layout.tsx  # sidebar + header
│       │   └── UI.tsx      # shared UI primitives
│       └── pages/
│           ├── Dashboard.tsx
│           ├── Products.tsx
│           ├── Orders.tsx
│           ├── Sellers.tsx
│           ├── Community.tsx
│           ├── Analytics.tsx
│           ├── Reviews.tsx
│           └── Settings.tsx
├── vite.config.ts
└── package.json
```

---

## 📊 Pages

| Page | Purpose |
|------|---------|
| Dashboard | KPIs — orders, revenue, active sellers |
| Products | CRUD catalog — approve / reject / edit |
| Orders | Order lifecycle management |
| Sellers | Verification + loyalty tier management |
| Community | Moderate posts, stories, recipes |
| Analytics | Sales charts, geography, top products |
| Reviews | Flag and respond to reviews |
| Settings | System config, locales, payment gateways |

---

## 🔌 API

```ts
import { listOrdersAdmin, approveProduct } from '@begim/shared';
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
