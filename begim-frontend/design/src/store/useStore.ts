import { create } from 'zustand';
import { fetchProducts } from '../api/catalog';
import { mockProducts } from '../data/mock';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  reviewsCount: number;
  isHalol?: boolean;
  isNew?: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;
}

interface AppState {
  // --- Каталог (общий кэш для всех экранов) ---
  products: Product[];
  productsLoading: boolean;
  productsOffline: boolean;
  selectedProductId: string | null;
  loadCatalog: () => Promise<void>;
  setSelectedProduct: (productId: string) => void;
  getProductById: (productId: string) => Product | undefined;

  // --- Корзина и избранное ---
  cart: CartItem[];
  favorites: Set<string>;
  addToCart: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  products: mockProducts,
  productsLoading: false,
  productsOffline: false,
  selectedProductId: null,

  loadCatalog: async () => {
    set({ productsLoading: true });
    try {
      const items = await fetchProducts();
      set({
        products: items.length ? items : mockProducts,
        productsOffline: items.length === 0,
        productsLoading: false,
      });
    } catch {
      // API недоступен — остаёмся на мок-данных, UI продолжает работать.
      set({ products: mockProducts, productsOffline: true, productsLoading: false });
    }
  },

  setSelectedProduct: (productId) => set({ selectedProductId: productId }),

  getProductById: (productId) => get().products.find((p) => p.id === productId),

  cart: [],
  favorites: new Set(),

  addToCart: (productId) =>
    set((state) => {
      const existing = state.cart.find((i) => i.id === productId);
      if (existing) {
        return {
          cart: state.cart.map((i) =>
            i.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { cart: [...state.cart, { id: productId, quantity: 1 }] };
    }),

  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((i) => i.id !== productId),
    })),

  updateCartQuantity: (productId, delta) =>
    set((state) => ({
      cart: state.cart
        .map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    })),

  clearCart: () => set({ cart: [] }),

  toggleFavorite: (productId) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return { favorites: next };
    }),
}));
