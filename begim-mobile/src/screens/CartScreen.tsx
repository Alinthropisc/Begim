import { products, formatPrice } from "../data/mockData";
import type { CartItem } from "../types";

interface Props {
  cart: CartItem[];
  onUpdateQty: (productId: string, delta: number) => void;
  onClear: () => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export default function CartScreen({
  cart,
  onUpdateQty,
  onClear,
  onContinueShopping,
  onCheckout,
}: Props) {
  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as { product: (typeof products)[0]; quantity: number }[];

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );
  const isEmpty = items.length === 0;

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll pt-8 pb-36">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Savatcha
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            {items.length} ta mahsulot
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={onClear}
            className="text-xs text-bordeaux font-medium"
          >
            Tozalash
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center mt-24 px-8">
          <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center text-5xl">
            🛒
          </div>
          <h3
            className="mt-4 text-xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Savatcha bo'sh
          </h3>
          <p className="mt-2 text-sm text-ink-muted text-center">
            Katalogdan shirinliklarni tanlang
          </p>
          <button
            onClick={onContinueShopping}
            className="mt-4 px-6 py-2.5 bg-bordeaux text-cream rounded-xl text-sm font-semibold shadow-lg shadow-bordeaux/30"
          >
            Katalogga o'tish
          </button>
        </div>
      ) : (
        <div className="mt-3 px-4 space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="bg-white rounded-2xl border border-gold/20 p-3 flex gap-3"
            >
              <img
                src={item.product.imageUrl}
                alt=""
                className="w-[70px] h-[70px] rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {item.product.name}
                </p>
                <p className="text-[11px] text-ink-muted">
                  {item.product.sellerName}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center bg-cream rounded-lg">
                    <button
                      onClick={() => onUpdateQty(item.product.id, -1)}
                      className="w-8 h-8 flex items-center justify-center text-bordeaux font-bold"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQty(item.product.id, 1)}
                      className="w-8 h-8 flex items-center justify-center text-bordeaux font-bold"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-bold text-bordeaux">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-4 bg-white rounded-2xl border border-gold/20 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Mahsulotlar:</span>
              <span className="font-semibold text-ink">
                {items.reduce((s, i) => s + i.quantity, 0)} ta
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Yetkazish:</span>
              <span className="font-semibold text-emerald">Bepul</span>
            </div>
            <div className="h-px bg-divider my-2" />
            <div className="flex justify-between items-baseline">
              <span className="text-base font-semibold text-ink">Jami:</span>
              <span className="text-xl font-bold text-bordeaux">
                {formatPrice(total)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Checkout bar */}
      {!isEmpty && (
        <div className="fixed bottom-16 left-0 right-0 mx-auto max-w-[380px] bg-white border-t border-divider px-4 py-3 z-10">
          <button
            onClick={onCheckout}
            className="w-full bg-bordeaux text-cream font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-bordeaux/30"
          >
            <span>✨</span> Buyurtma berish · {formatPrice(total)}
          </button>
        </div>
      )}
    </div>
  );
}
