import { useState } from 'react';
import { useStore } from '../store/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { mockStories as stories, categories } from '../data/mock';

const formatPrice = (price: number) =>
  price.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";

interface Props {
  onNavigate?: (screen: 'community' | 'catalog' | 'cart') => void;
  onProductClick?: () => void;
}

export function HomeScreen({ onProductClick }: Props) {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const products = useStore((state) => state.products);
  const addToCart = useStore((state) => state.addToCart);
  const setSelectedProduct = useStore((state) => state.setSelectedProduct);
  const tg = useTelegram();

  const toggleFav = (id: string) => {
    const next = new Set(favs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFavs(next);
    tg.HapticFeedback.impactOccurred('light');
  };

  const quickAdd = (productId: string) => {
    addToCart(productId);
    tg.HapticFeedback.notificationOccurred('success');
  };

  const openProduct = (productId: string) => {
    setSelectedProduct(productId);
    onProductClick?.();
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-bordeaux)] border-2 border-[var(--color-gold)] flex items-center justify-center text-xl">
            🥮
          </div>
          <div className="flex-1">
            <h1
              className="text-xl font-bold text-[var(--color-bordeaux)]"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              Begim
            </h1>
            <p className="text-xs text-[var(--tg-theme-hint-color, var(--color-ink-muted))]">
              Xush kelibsiz!
            </p>
          </div>
          <button className="relative w-11 h-11 rounded-xl bg-white border border-[var(--color-divider)] flex items-center justify-center">
            <span className="text-xl">🔔</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-bordeaux)] text-white text-[10px] flex items-center justify-center font-bold">
              2
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 bg-white rounded-xl border border-[var(--color-divider)] flex items-center px-3 py-2.5">
          <span className="text-[var(--color-ink-muted)] mr-2">🔍</span>
          <input
            type="text"
            placeholder="Shirinlik qidirish..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--tg-theme-hint-color)]"
          />
        </div>
      </div>

      {/* Stories */}
      <div className="mt-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {stories.map((s) => (
          <div key={s.id} className="flex-shrink-0 w-[68px] flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-full p-[2px] ${
                s.isAdd ? 'bg-[var(--color-cream-dark)]' : 'bg-gradient-to-br from-[var(--color-bordeaux)] to-[var(--color-gold)]'
              }`}
            >
              <div className="w-full h-full rounded-full bg-[var(--color-cream)] p-[2px]">
                {s.isAdd ? (
                  <div className="w-full h-full rounded-full bg-[var(--color-bordeaux)]/10 flex items-center justify-center">
                    <span className="text-2xl text-[var(--color-bordeaux)] font-light">+</span>
                  </div>
                ) : (
                  <img src={s.avatar} alt={s.name} className="w-full h-full rounded-full object-cover" />
                )}
              </div>
            </div>
            <p className="mt-1 text-[11px] text-[var(--tg-theme-text-color)] truncate w-full text-center">
              {s.isAdd ? "Qo'shish" : s.name}
            </p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-[var(--tg-theme-text-color)]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Kategoriyalar
        </h2>
        <button className="text-xs text-[var(--color-bordeaux)] font-medium">Hammasi</button>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
        {categories.map((c) => (
          <div key={c.id} className="flex-shrink-0 w-[72px] flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white border border-[var(--color-gold)]/30 flex items-center justify-center text-2xl">
              {c.icon}
            </div>
            <p className="mt-1.5 text-[11px] text-[var(--tg-theme-text-color)] font-medium truncate w-full text-center">
              {c.name}
            </p>
          </div>
        ))}
      </div>

      {/* Popular */}
      <div className="px-4 mt-4 flex items-center justify-between">
        <h2
          className="text-lg font-semibold text-[var(--tg-theme-text-color)]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Mashhur
        </h2>
        <button className="text-xs text-[var(--color-bordeaux)] font-medium">Hammasi</button>
      </div>

      {/* Product grid */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        {products.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border border-[var(--color-gold)]/20 shadow-sm"
          >
            <button onClick={() => openProduct(p.id)} className="w-full text-left">
              <div className="relative aspect-square">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(p.id);
                  }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 flex items-center justify-center"
                >
                  <span className="text-sm">{favs.has(p.id) ? '❤️' : '🤍'}</span>
                </button>
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {p.isNew && (
                    <span className="px-2 py-0.5 rounded bg-[var(--color-bordeaux)] text-white text-[10px] font-bold">
                      YANGI
                    </span>
                  )}
                  {p.isHalol && (
                    <span className="px-2 py-0.5 rounded bg-[var(--color-emerald)] text-white text-[10px] font-bold">
                      HALOL
                    </span>
                  )}
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-[var(--tg-theme-text-color)] truncate">{p.name}</p>
                <p className="text-[11px] text-[var(--tg-theme-hint-color)]">{p.sellerName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">⭐</span>
                    <span className="text-[11px] font-semibold text-[var(--tg-theme-text-color)]">{p.rating}</span>
                  </div>
                  <p className="text-xs font-bold text-[var(--color-bordeaux)]">{formatPrice(p.price)}</p>
                </div>
              </div>
            </button>
            <div className="px-3 pb-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  quickAdd(p.id);
                }}
                className="w-full py-2 rounded-lg bg-[var(--color-bordeaux)]/10 text-[var(--color-bordeaux)] text-xs font-semibold hover:bg-[var(--color-bordeaux)] hover:text-white transition-colors active:scale-95"
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
