import { useState } from "react";
import { products, formatPrice } from "../data/mockData";

interface Props {
  onBack: () => void;
  onAddToCart?: (productId: string) => void;
}

export default function ProductScreen({ onBack, onAddToCart }: Props) {
  const product = products[0];
  const [isFav, setIsFav] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    onAddToCart?.(product.id);
  };

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll">
      {/* Hero image */}
      <div className="relative h-[400px]">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute top-10 left-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-lg"
          >
            ←
          </button>
        </div>
        <div className="absolute top-10 right-4">
          <button
            onClick={() => setIsFav(!isFav)}
            className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center text-lg"
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>
      </div>

      {/* Info card */}
      <div className="-mt-8 relative mx-4 bg-white rounded-2xl border border-gold/20 pb-24">
        <div className="p-4">
          {/* Badges */}
          <div className="flex gap-2">
            {product.isHalol && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald/10 text-emerald text-[11px] font-semibold flex items-center gap-1">
                ✓ Halol
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-lg bg-bordeaux/10 text-bordeaux text-[11px] font-bold">
                YANGI
              </span>
            )}
          </div>

          <h1
            className="mt-3 text-2xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h1>

          <div className="mt-1 flex items-center gap-1 text-sm">
            <span className="text-gold">⭐</span>
            <span className="font-semibold">{product.rating}</span>
            <span className="text-ink-muted text-xs">({product.reviewsCount} ta sharh)</span>
          </div>

          {/* Seller */}
          <div className="mt-4 p-3 bg-cream rounded-xl flex items-center gap-3">
            <img
              src={product.sellerAvatar}
              alt={product.sellerName}
              className="w-11 h-11 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-[11px] text-ink-muted">Sotuvchi</p>
              <p className="text-sm font-semibold text-ink">{product.sellerName}</p>
            </div>
            <span className="text-ink-light">›</span>
          </div>

          {/* Description */}
          <h3 className="mt-4 font-semibold text-ink">Tavsif</h3>
          <p className="mt-2 text-sm text-ink leading-relaxed">{product.description}</p>

          {/* Specs */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Vazni", value: "1 kg" },
              { label: "Tayyorlanish", value: "2 soat" },
              { label: "Yetkazish", value: "24 soat" },
            ].map((s) => (
              <div key={s.label} className="bg-cream rounded-lg p-2.5 text-center">
                <p className="text-[10px] text-ink-muted">{s.label}</p>
                <p className="text-xs font-semibold text-ink mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-[380px] bg-white border-t border-divider px-4 py-3">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] text-ink-muted">Narxi</p>
            <p className="text-lg font-bold text-bordeaux">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-bordeaux text-cream font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg shadow-bordeaux/30"
          >
            {added ? (
              <>✓ Qo'shildi</>
            ) : (
              <>
                <span>🛒</span> Savatga qo'shish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
