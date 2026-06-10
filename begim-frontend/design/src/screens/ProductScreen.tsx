import { useStore } from '../store/useStore';
import { useTelegram } from '../hooks/useTelegram';

const formatPrice = (price: number) =>
  price.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";

export function ProductScreen({ onBack }: { onBack?: () => void }) {
  const addToCart = useStore((state) => state.addToCart);
  const selectedId = useStore((state) => state.selectedProductId);
  const getProductById = useStore((state) => state.getProductById);
  const products = useStore((state) => state.products);
  const tg = useTelegram();

  // Выбранный товар, иначе первый из каталога (на случай прямого входа на экран).
  const product = (selectedId ? getProductById(selectedId) : undefined) ?? products[0];

  if (!product) {
    return (
      <div className="p-8 text-center text-[var(--tg-theme-hint-color)]">
        <p className="text-4xl mb-3">🍰</p>
        <p>Mahsulot topilmadi</p>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product.id);
    tg.HapticFeedback.notificationOccurred('success');
  };

  return (
    <div className="pb-20">
      <div className="relative">
        <img src={product.imageUrl} alt={product.name} className="w-full h-[300px] object-cover" />
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow-md text-xl font-bold"
          >
            ‹
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-3">
          {product.isHalol && (
            <span className="px-2.5 py-1 rounded-lg bg-[var(--color-emerald)]/10 text-[var(--color-emerald)] text-[11px] font-semibold flex items-center gap-1">
              ✓ Halol
            </span>
          )}
        </div>

        <h1
          className="text-2xl font-semibold text-[var(--tg-theme-text-color)]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {product.name}
        </h1>

        <div className="mt-2 flex items-center gap-1 text-sm">
          <span className="text-[var(--color-gold)]">⭐</span>
          <span className="font-semibold">{product.rating}</span>
          <span className="text-[var(--tg-theme-hint-color)] text-xs">
            ({product.reviewsCount} ta sharh)
          </span>
        </div>

        <div className="mt-4 p-3 bg-[var(--color-cream-dark)] rounded-xl flex items-center gap-3">
          <img src={product.sellerAvatar} alt="" className="w-11 h-11 rounded-full object-cover" />
          <div className="flex-1">
            <p className="text-[11px] text-[var(--tg-theme-hint-color)]">Sotuvchi</p>
            <p className="text-sm font-semibold text-[var(--tg-theme-text-color)]">{product.sellerName}</p>
          </div>
        </div>

        <h3 className="mt-4 font-semibold text-[var(--tg-theme-text-color)]">Tavsif</h3>
        <p className="mt-2 text-sm text-[var(--tg-theme-text-color)] leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Vazni', value: '1 kg' },
            { label: 'Tayyorlanish', value: '2 soat' },
            { label: 'Yetkazish', value: '24 soat' },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-cream-dark)] rounded-lg p-2.5 text-center">
              <p className="text-[10px] text-[var(--tg-theme-hint-color)]">{s.label}</p>
              <p className="text-xs font-semibold text-[var(--tg-theme-text-color)] mt-0.5">{s.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-divider)] px-4 py-3 safe-area-bottom">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-[11px] text-[var(--tg-theme-hint-color)]">Narxi</p>
            <p className="text-lg font-bold text-[var(--color-bordeaux)]">{formatPrice(product.price)}</p>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <span>🛒</span> Savatga qo'shish
          </button>
        </div>
      </div>
    </div>
  );
}
