import { products, stories, categories, formatPrice } from "../data/mockData";

interface Props {
  onNavigate?: (screen: "community" | "catalog" | "cart") => void;
  onProductClick?: () => void;
  onAddToCart?: (productId: string) => void;
}

import { useState } from "react";

export default function HomeScreen({ onProductClick, onAddToCart }: Props) {
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const toggleFav = (id: string) => {
    const next = new Set(favs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavs(next);
  };

  const quickAddToCart = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    onAddToCart?.(productId);
  };

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll pt-8 pb-20">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-bordeaux border-2 border-gold flex items-center justify-center text-xl">
            🥮
          </div>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-bordeaux"
              style={{ fontFamily: "var(--font-arabic)" }}
            >
              Begim
            </h1>
            <p className="text-xs text-ink-muted">Xush kelibsiz!</p>
          </div>
          <button className="relative w-11 h-11 rounded-xl bg-white border border-divider flex items-center justify-center">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-bordeaux text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 bg-white rounded-xl border border-divider flex items-center px-3 py-2.5">
          <span className="text-ink-muted mr-2">🔍</span>
          <input
            type="text"
            placeholder="Shirinlik qidirish..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-light"
          />
          <button className="text-bordeaux ml-2">⚙️</button>
        </div>
      </div>

      {/* Stories */}
      <div className="mt-4 flex gap-3 overflow-x-auto phone-scroll px-4 pb-2">
        {stories.map((s) => {
          const isAdd = s.sellerAvatar === "";
          return (
            <div key={s.id} className="flex-shrink-0 w-[68px] flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-full p-[2px] ${
                  isAdd ? "bg-cream-dark" : "bg-gradient-to-br from-bordeaux to-gold"
                }`}
              >
                <div className="w-full h-full rounded-full bg-cream p-[2px]">
                  {isAdd ? (
                    <div className="w-full h-full rounded-full bg-bordeaux/10 flex items-center justify-center">
                      <span className="text-2xl text-bordeaux font-light">+</span>
                    </div>
                  ) : (
                    <img
                      src={s.sellerAvatar}
                      alt={s.sellerName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
              </div>
              <p className="mt-1 text-[11px] text-ink truncate w-full text-center">
                {isAdd ? "Qo'shish" : s.sellerName}
              </p>
            </div>
          );
        })}
      </div>

      {/* Categories */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Kategoriyalar
        </h2>
        <button className="text-xs text-bordeaux font-medium">Hammasi</button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto phone-scroll px-4 pb-2">
        {categories.map((c) => (
          <div key={c.id} className="flex-shrink-0 w-[72px] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-gold/30 flex items-center justify-center text-2xl">
              {c.icon}
            </div>
            <p className="mt-1.5 text-[11px] text-ink font-medium truncate w-full text-center">
              {c.name}
            </p>
          </div>
        ))}
      </div>

      {/* Popular */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Mashhur
        </h2>
        <button className="text-xs text-bordeaux font-medium">Hammasi</button>
      </div>

      {/* Product grid */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        {products.slice(0, 6).map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-sm hover:shadow-md transition-shadow"
          >
            <button onClick={onProductClick} className="w-full text-left">
              <div className="relative aspect-square">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(p.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center"
                >
                  <span className="text-sm">{favs.has(p.id) ? "❤️" : "🤍"}</span>
                </button>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {p.isNew && (
                    <span className="px-2 py-0.5 rounded bg-bordeaux text-white text-[10px] font-bold">
                      YANGI
                    </span>
                  )}
                  {p.isHalol && (
                    <span className="px-2 py-0.5 rounded bg-emerald text-white text-[10px] font-bold">
                      HALOL
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                <p className="text-[11px] text-ink-muted">{p.sellerName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">⭐</span>
                    <span className="text-[11px] font-semibold text-ink">{p.rating}</span>
                  </div>
                  <p className="text-xs font-bold text-bordeaux">{formatPrice(p.price)}</p>
                </div>
              </div>
            </button>
            {/* Quick add to cart */}
            <div className="px-3 pb-3">
              <button
                onClick={(e) => quickAddToCart(e, p.id)}
                className="w-full py-2 rounded-lg bg-bordeaux/10 text-bordeaux text-xs font-semibold hover:bg-bordeaux hover:text-cream transition-colors"
              >
                + Savatga
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
