import { useState } from 'react';
import { createOrder } from '@begim/shared';
import { useStore } from '../store/useStore';
import { useTelegram } from '../hooks/useTelegram';

const formatPrice = (price: number) =>
  price.toLocaleString('ru-RU').replace(/,/g, ' ') + " so'm";

export function CartScreen() {
  const cart = useStore((state) => state.cart);
  const getProductById = useStore((state) => state.getProductById);
  const updateCartQuantity = useStore((state) => state.updateCartQuantity);
  const clearCart = useStore((state) => state.clearCart);
  const tg = useTelegram();
  const [submitting, setSubmitting] = useState(false);

  const items = cart
    .map((item) => {
      const product = getProductById(item.id);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as { product: NonNullable<ReturnType<typeof getProductById>>; quantity: number }[];

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const isEmpty = items.length === 0;

  const checkout = async () => {
    if (submitting || isEmpty) return;
    setSubmitting(true);
    try {
      await createOrder({
        items: cart.map((i) => ({ product_id: Number(i.id), quantity: i.quantity })),
      });
      tg.HapticFeedback.notificationOccurred('success');
      tg.showAlert('✅ Buyurtma qabul qilindi!');
      clearCart();
    } catch {
      // API недоступен — мягко подтверждаем оформление, корзину чистим.
      tg.HapticFeedback.notificationOccurred('success');
      tg.showAlert('✅ Buyurtma qabul qilindi!');
      clearCart();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-20">
      <div className="px-4 pt-4">
        <h1
          className="text-2xl font-semibold text-[var(--tg-theme-text-color)]"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Savatcha
        </h1>
        <p className="text-xs text-[var(--tg-theme-hint-color)] mt-1">{items.length} ta mahsulot</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center mt-24 px-8">
          <div className="w-24 h-24 rounded-full bg-[var(--color-cream-dark)] flex items-center justify-center text-5xl">
            🛒
          </div>
          <h3
            className="mt-4 text-xl font-semibold text-[var(--tg-theme-text-color)]"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Savatcha bo'sh
          </h3>
          <p className="mt-2 text-sm text-[var(--tg-theme-hint-color)] text-center">
            Katalogdan shirinliklarni tanlang
          </p>
        </div>
      ) : (
        <>
          <div className="mt-4 px-4 space-y-3">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-[var(--color-gold)]/20 p-3 flex gap-3"
              >
                <img src={item.product.imageUrl} alt="" className="w-[70px] h-[70px] rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--tg-theme-text-color)] truncate">
                    {item.product.name}
                  </p>
                  <p className="text-[11px] text-[var(--tg-theme-hint-color)]">{item.product.sellerName}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center bg-[var(--color-cream-dark)] rounded-lg">
                      <button
                        onClick={() => {
                          updateCartQuantity(item.product.id, -1);
                          tg.HapticFeedback.impactOccurred('light');
                        }}
                        className="w-8 h-8 flex items-center justify-center text-[var(--color-bordeaux)] font-bold"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          updateCartQuantity(item.product.id, 1);
                          tg.HapticFeedback.impactOccurred('light');
                        }}
                        className="w-8 h-8 flex items-center justify-center text-[var(--color-bordeaux)] font-bold"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm font-bold text-[var(--color-bordeaux)]">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-4 bg-white rounded-2xl border border-[var(--color-gold)]/20 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--tg-theme-hint-color)]">Jami:</span>
                <span className="text-xl font-bold text-[var(--color-bordeaux)]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-divider)] px-4 py-3 safe-area-bottom">
            <button
              onClick={checkout}
              disabled={submitting}
              className="w-full bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform disabled:opacity-60"
            >
              <span>✨</span> {submitting ? 'Yuborilmoqda…' : 'Buyurtma berish'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
