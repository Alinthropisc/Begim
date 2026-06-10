import { useState } from "react";
import { products, categories, formatPrice } from "../data/mockData";

interface Props {
  onProductClick?: () => void;
  onAddToCart?: (productId: string) => void;
}

export default function CatalogScreen({ onProductClick, onAddToCart }: Props) {
  const [selectedCat, setSelectedCat] = useState("all");
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const filtered =
    selectedCat === "all"
      ? products
      : products.filter((p) => p.category === selectedCat);

  const quickAdd = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onAddToCart?.(id);
  };

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll pt-8 pb-20">
      {/* Header */}
      <div className="px-4 pt-4">
        <h1 className="text-2xl font-semibold text-ink" style={{ fontFamily: "var(--font-display)" }}>
          Katalog
        </h1>
        <p className="text-xs text-ink-muted mt-1">{filtered.length} ta mahsulot</p>

        {/* Search */}
        <div className="mt-3 bg-white rounded-xl border border-divider flex items-center px-3 py-2.5">
          <span className="text-ink-muted mr-2">🔍</span>
          <input
            type="text"
            placeholder="Qidirish..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-light"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mt-3 flex gap-2 overflow-x-auto phone-scroll px-4 pb-2">
        {categories.map((c) => {
          const active = c.id === selectedCat;
          return (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                active
                  ? "bg-bordeaux text-cream border-bordeaux"
                  : "bg-white text-ink border-divider"
              }`}
            >
              <span>{c.icon}</span>
              <span className="text-xs font-medium">{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* Products */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-sm"
          >
            <button onClick={onProductClick} className="w-full text-left">
              <div className="relative aspect-square">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = new Set(favs);
                    if (next.has(p.id)) next.delete(p.id);
                    else next.add(p.id);
                    setFavs(next);
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
            <div className="px-3 pb-3">
              <button
                onClick={(e) => quickAdd(e, p.id)}
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
