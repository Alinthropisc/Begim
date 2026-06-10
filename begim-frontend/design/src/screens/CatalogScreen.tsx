import { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { useTelegram } from '../hooks/useTelegram';
import { categories } from '../data/mock';

const formatPrice = (price: number) =>
  price.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";

export function CatalogScreen({ onProductClick }: { onProductClick?: () => void }) {
  const products = useStore((state) => state.products);
  const loading = useStore((state) => state.productsLoading);
  const addToCart = useStore((state) => state.addToCart);
  const setSelectedProduct = useStore((state) => state.setSelectedProduct);
  const tg = useTelegram();

  const [activeCategory, setActiveCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCat = activeCategory === 'all' || p.category === activeCategory;
      const byQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sellerName.toLowerCase().includes(query.toLowerCase());
      return byCat && byQuery;
    });
  }, [products, activeCategory, query]);

  const openProduct = (productId: string) => {
    setSelectedProduct(productId);
    onProductClick?.();
  };

  return (
    <div className="pb-4">
      {/* Search */}
      <div className="px-4 pt-4">
        <div className="bg-white rounded-xl border border-[var(--color-divider)] flex items-center px-3 py-2.5">
          <span className="text-[var(--color-ink-muted)] mr-2">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Shirinlik qidirish..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--tg-theme-hint-color)]"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((c) => {
          const active = activeCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id);
                tg.HapticFeedback.selectionChanged();
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold border transition-colors ${
                active
                  ? 'bg-[var(--color-bordeaux)] text-white border-[var(--color-bordeaux)]'
                  : 'bg-white text-[var(--tg-theme-text-color)] border-[var(--color-divider)]'
              }`}
            >
              {c.icon} {c.name}
            </button>
          );
        })}
      </div>

      {loading && (
        <p className="px-4 mt-6 text-center text-sm text-[var(--tg-theme-hint-color)]">Yuklanmoqda…</p>
      )}

      {!loading && filtered.length === 0 && (
        <div className="px-4 mt-10 text-center text-[var(--tg-theme-hint-color)]">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">Hech narsa topilmadi</p>
        </div>
      )}

      {/* Product grid */}
      <div className="mt-3 px-4 grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl overflow-hidden border border-[var(--color-gold)]/20 shadow-sm"
          >
            <button onClick={() => openProduct(p.id)} className="w-full text-left">
              <div className="relative aspect-square">
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                {p.isHalol && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[var(--color-emerald)] text-white text-[10px] font-bold">
                    HALOL
                  </span>
                )}
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
                onClick={() => {
                  addToCart(p.id);
                  tg.HapticFeedback.notificationOccurred('success');
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
