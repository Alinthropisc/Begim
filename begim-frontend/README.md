# 🌐 begim-frontend

> **The public face.** Landing page, full marketplace, and back-office — all in one React app, routed by path.

---

## 🛠️ Stack

| | |
|--|--|
| Framework | **React 18** + **TypeScript** |
| Bundler | **Vite 5** |
| Styling | **Tailwind CSS 4** |
| Routing | **react-router-dom 6** |
| HTTP | **@begim/shared** (zero-dep API client) |
| Port | **5173** |

---

## 🚀 Run

```bash
npm install
npm run dev    # → http://localhost:5173
```

---

## 🗺️ Routes

| Path | What |
|------|------|
| `/` | Landing page — hero, features, sellers showcase |
| `/shop/*` | Full marketplace (BegimApp) |
| `/admin/*` | Back-office dashboard (AdminApp) |

---

## 🗂️ Structure

```
begim-frontend/
├── src/
│   ├── main.tsx            # entry
│   ├── App.tsx             # top-level router — /, /shop, /admin
│   ├── index.css           # global styles
│   ├── data/               # mock data + types (pre-API)
│   └── components/         # shared UI components
├── vite.config.ts          # port 5173, @begim/shared alias
└── package.json
```

---

## 🔌 API Connection

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
