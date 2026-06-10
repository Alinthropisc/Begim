# 🔗 begim-shared

> **The single source of truth.** Zero-dependency TypeScript API client shared across every front-end in the monorepo.

---

## Why this exists

Three clients (Mini App, website, admin) + one backend = one contract.
`begim-shared` owns that contract so you never copy-paste a type or a `fetch` call.

---

## 📦 What's inside

| File | Purpose |
|------|---------|
| `types.ts` | Domain types — `Product`, `Order`, `Seller`, … Money in `*_minor` (tiyin) |
| `http.ts` | `fetch` wrapper — JWT header, auto-refresh on 401, error parsing |
| `auth.ts` | `loginWithTelegram`, `ensureSession`, `fetchMe`, `logout` |
| `endpoints.ts` | Typed API functions — products, orders, feed, reviews, community |
| `admin.ts` | Admin-only endpoints (`role=admin`) |
| `format.ts` | `formatMoney`, `formatDateTime`, minor ↔ major conversions |
| `index.ts` | Barrel export — always import from here |

**Zero runtime dependencies** — uses native `fetch`. Drop it anywhere.

---

## ⚡ Setup in a new app

**1. `vite.config.ts`**

```ts
resolve: { alias: { '@begim/shared': '<path>/begim-shared/index.ts' } },
server: { fs: { allow: ['..'] } },
```

**2. `tsconfig.json`**

```jsonc
{
  "compilerOptions": {
    "paths": { "@begim/shared": ["../begim-shared/index.ts"] }
  }
}
```

**3. Bootstrap once**

```ts
import { configureApi, ensureSession } from '@begim/shared';

configureApi({
  baseUrl: import.meta.env.VITE_API_URL,
  getInitData: () => window.Telegram?.WebApp?.initData ?? '',
});

await ensureSession();
```

**4. Use anywhere**

```ts
import { listProducts, createOrder, formatMoney } from '@begim/shared';

const { items } = await listProducts({ city: 1, sort: 'popular' });
console.log(formatMoney(items[0].price_minor));   // "180 000 so'm"
```

---

## 🔑 Token storage

JWT stored in `localStorage` under `begim.access` / `begim.refresh`.
Override via `configureApi({ tokens })`. Session expiry triggers `onAuthExpired`.

---

## 💰 Money convention

All monetary values are in **tiyin** (`*_minor`).
Always use `formatMoney()` for display — never divide manually.

---

> Part of the [Begim monorepo](../README.md)
