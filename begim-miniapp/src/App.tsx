import { useState, useEffect, useMemo } from "react";
import {
  Search, Heart, ShoppingBag, Star, Plus, Minus, X,
  MapPin, Phone, ChevronRight, Shield,
  Store, Send, User, Home, Grid3x3, CheckCircle2, Users, BookOpen, Eye, MessageCircle
} from "lucide-react";
import {
  products, categories, reviews, stories, formatPrice,
  type Product
} from "./data/products";
import { useT, type Lang } from "./i18n";
import { getSellerById } from "./data/sellers";
import StoryViewer from "./components/StoryViewer";
import CommunityView from "./components/CommunityView";
import TelegramBanner from "./components/TelegramBanner";
import { useTelegram } from "./hooks/useTelegram";

type CartItem = { id: string; qty: number };
type View = "home" | "categories" | "community" | "recipes" | "fav" | "profile" | "seller";

declare global {
  interface Window {
    Telegram?: { WebApp?: any };
  }
}

export default function App() {
  const [view, setView] = useState<View>("home");
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fav, setFav] = useState<string[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showSeller, setShowSeller] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Stories
  const [lang, setLang] = useState<Lang>("uz");
  const tr = useT(lang);

  const [storyIndex, setStoryIndex] = useState<number | null>(null);

  // Telegram Banner
  const [telegramBanner, setTelegramBanner] = useState<null | "buy" | "review" | "register" | "community">(null);

  // Telegram WebApp integration
  const tg = useTelegram();
  const isTelegram = tg.isAvailable && !!tg.initData;
  const tgUser = tg.user;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) return false;
      if (query && !(`${p.name} ${p.nameUz} ${p.seller}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [activeCategory, query]);

  const cartItems = useMemo(
    () => cart.map((c) => ({ ...c, product: products.find((p) => p.id === c.id)! })).filter((c) => c.product),
    [cart]
  );
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cartItems.reduce((s, c) => s + c.product.price * c.qty, 0);
  const favProducts = products.filter((p) => fav.includes(p.id));

  const addToCart = (id: string) => {
    setCart((prev) => {
      const e = prev.find((c) => c.id === id);
      if (e) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c));
      return [...prev, { id, qty: 1 }];
    });
    tg.haptic("light");
    setToast(tr.added_to_cart);
  };
  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };
  const toggleFav = (id: string) => {
    setFav((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      tg.haptic("light");
      return next;
    });
  };

  const checkout = async () => {
    if (!isTelegram) {
      setShowCart(false);
      setTelegramBanner("buy");
      return;
    }

    const orderData = {
      action: "order",
      items: cartItems.map((it) => ({
        id: it.product.id,
        name: it.product.name,
        qty: it.qty,
        price: it.product.price,
      })),
      total: cartTotal,
      customer: tgUser ? {
        id: tgUser.id,
        name: `${tgUser.first_name} ${tgUser.last_name || ""}`.trim(),
        username: tgUser.username,
      } : null,
      createdAt: new Date().toISOString(),
    };

    // Use fetch instead of sendData — sendData always closes the mini app
    try {
      await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
    } catch {
      // Backend not yet connected — continue optimistically
    }

    tg.haptic("medium");
    setCheckoutDone(true);
    setTimeout(() => {
      setCart([]);
      setShowCart(false);
      setCheckoutDone(false);
    }, 2500);
  };

  const requireTelegram = (action: "buy" | "review" | "register" | "community") => {
    if (!isTelegram) setTelegramBanner(action);
  };

  return (
    <div className="min-h-screen begim-pattern pb-24 md:pb-0">
      {/* ============ WEB-ONLY TOP BANNER: Open in Telegram ============ */}
      {!isTelegram && (
        <div className="hidden md:block bg-gradient-to-r from-[#229ED9] via-[#1a7fb0] to-[#229ED9] text-white">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              <span>Telegram Mini App'da yanada qulayroq!</span>
            </div>
            <button
              onClick={() => setTelegramBanner("register")}
              className="text-xs font-semibold bg-white text-[#229ED9] px-3 py-1 rounded-full hover:scale-105 transition"
            >
              Ochish →
            </button>
          </div>
        </div>
      )}

      {/* ============ HEADER ============ */}
      <header className="sticky top-0 z-40 bg-[#FBF5EC]/95 backdrop-blur-md border-b border-[#C9A961]/20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 pt-safe">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => setView("home")} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B2635] to-[#6B1A27] flex items-center justify-center shadow-md shadow-[#8B2635]/20 ring-2 ring-[#C9A961]/30 group-hover:ring-[#C9A961] transition">
                <span className="text-[#E4CE8A] font-[Amiri] font-bold text-lg">ب</span>
              </div>
              <div className="leading-tight text-left">
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635] tracking-tight">Begim</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B7355] -mt-1">
                  {tr.subtitle}
                </div>
              </div>
            </button>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1 ml-6">
              {[
                { id: "home", label: "Bosh" },
                { id: "categories", label: "Katalog" },
                { id: "community", label: "Hamjamiyat" },
              ].map((n) => (
                <button
                  key={n.id}
                  onClick={() => setView(n.id as View)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    view === n.id
                      ? "bg-[#8B2635] text-[#FBF5EC]"
                      : "text-[#2B1810] hover:bg-[#C9A961]/10"
                  }`}
                >
                  {n.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setLang((l) => l === "uz" ? "ru" : "uz")}
                className="text-[10px] font-bold text-[#8B7355] hover:text-[#8B2635] w-8 h-8 rounded-full hover:bg-[#C9A961]/10 flex items-center justify-center transition"
              >
                {lang === "uz" ? "RU" : "UZ"}
              </button>
              <button
                onClick={() => setView("fav")}
                className="relative w-10 h-10 rounded-full hover:bg-[#C9A961]/10 flex items-center justify-center transition"
                aria-label="Sevimlilar"
              >
                <Heart className={`w-5 h-5 ${fav.length > 0 ? "fill-[#8B2635] text-[#8B2635]" : "text-[#2B1810]"}`} />
                {fav.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B2635] text-[#FBF5EC] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {fav.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative w-10 h-10 rounded-full hover:bg-[#C9A961]/10 flex items-center justify-center transition"
                aria-label="Savat"
              >
                <ShoppingBag className="w-5 h-5 text-[#2B1810]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B2635] text-[#FBF5EC] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => isTelegram ? setView("profile") : requireTelegram("register")}
                className="hidden md:flex w-10 h-10 rounded-full bg-[#8B2635] text-[#FBF5EC] items-center justify-center ml-2 hover:bg-[#6B1A27] transition"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stories strip — только на главной */}
          {view === "home" && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1.5 -mx-4 px-4">
              <button
                onClick={() => requireTelegram("register")}
                className="flex-shrink-0"
              >
                <div className="w-9 h-9 rounded-full bg-[#FBF5EC] border-2 border-dashed border-[#C9A961]/60 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-[#8B2635]" />
                </div>
              </button>

              {stories.map((s, i) => (
                <button key={s.id} onClick={() => setStoryIndex(i)} className="flex-shrink-0">
                  <div className={`p-[2px] rounded-full ${s.viewed ? "bg-[#C9A961]/30" : "bg-gradient-to-tr from-[#8B2635] via-[#C9A961] to-[#E4CE8A]"}`}>
                    <div className="bg-[#FBF5EC] p-[1.5px] rounded-full">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src={s.image} alt={s.seller} className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search — прилипает под историями */}
          {view === "home" && (
            <div className="pb-2">
              <SearchBar query={query} setQuery={setQuery} placeholder={tr.search_placeholder} />
            </div>
          )}
        </div>
      </header>

      {/* ============ MAIN ============ */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === "home" && (
          <HomeView
            products={filtered}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onSelect={setSelected}
            onFav={toggleFav}
            favSet={new Set(fav)}
            onAdd={addToCart}
            onOpenSeller={() => isTelegram ? setShowSeller(true) : requireTelegram("register")}
            onOpenStory={(i) => setStoryIndex(i)}
            onOpenCommunity={() => setView("community")}
            onOpenApp={() => requireTelegram("register")}
            onViewAll={() => { setActiveCategory("all"); setView("categories"); }}
            onViewCategory={(cat: string) => { setActiveCategory(cat); setView("categories"); }}
            query={query}
            setQuery={setQuery}
            tr={tr}
            lang={lang}
          />
        )}

        {view === "categories" && (
          <CategoriesView
            products={filtered}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onSelect={setSelected}
            onFav={toggleFav}
            favSet={new Set(fav)}
            onAdd={addToCart}
            lang={lang}
          />
        )}

        {view === "community" && (
          <CommunityView onOpenApp={() => requireTelegram("community")} lang={lang} />
        )}

        {view === "recipes" && (
          <RecipesView onOpenApp={() => requireTelegram("register")} />
        )}

        {view === "seller" && (
          <SellerView lang={lang} onBack={() => setView("profile")} />
        )}

        {view === "fav" && (
          <FavoritesView
            products={favProducts}
            onSelect={setSelected}
            onFav={toggleFav}
            favSet={new Set(fav)}
            onAdd={addToCart}
          />
        )}

        {view === "profile" && (
          <ProfileView
            onOpenSeller={() => setShowSeller(true)}
            tgUser={tgUser} tr={tr} lang={lang}
            onNavigate={setView}
            setLang={setLang}
          />
        )}
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="hidden md:block mt-16 begim-pattern-dark text-[#FBF5EC]">
        <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A961] flex items-center justify-center">
                <span className="text-[#8B2635] font-[Amiri] font-bold text-lg">ب</span>
              </div>
              <span className="font-[Cormorant_Garamond] text-3xl font-semibold">Begim</span>
            </div>
            <p className="text-[#F3E8D4]/80 max-w-sm">
              O'zbek ayollarining uyda tayyorlangan shirinlik va non mahsulotlari bozori.
              Halol, sifatli, mehribon qo'llardan.
            </p>
            <div className="mt-4 h-6 begim-ornament opacity-80" />
          </div>
          <div>
            <h4 className="font-[Cormorant_Garamond] text-xl mb-3 text-[#E4CE8A]">Havolalar</h4>
            <ul className="space-y-2 text-[#F3E8D4]/80">
              <li><button onClick={() => setView("home")} className="hover:text-[#E4CE8A]">Bosh sahifa</button></li>
              <li><button onClick={() => setView("categories")} className="hover:text-[#E4CE8A]">Katalog</button></li>
              <li><button onClick={() => setView("community")} className="hover:text-[#E4CE8A]">Hamjamiyat</button></li>
              <li><button onClick={() => requireTelegram("register")} className="hover:text-[#E4CE8A]">Yordam</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-[Cormorant_Garamond] text-xl mb-3 text-[#E4CE8A]">Aloqa</h4>
            <ul className="space-y-2 text-[#F3E8D4]/80">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +998 90 123 45 67</li>
              <li className="flex items-center gap-2"><Send className="w-4 h-4" /> @begim_uz_bot</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Toshkent, O'zbekiston</li>
            </ul>
            <button
              onClick={() => requireTelegram("community")}
              className="mt-4 btn-gold px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Telegram kanal
            </button>
          </div>
        </div>
        <div className="border-t border-[#C9A961]/20 py-4 text-center text-sm text-[#F3E8D4]/60">
          © 2026 Begim. Barcha huquqlar himoyalangan. ✦ Bismillahir Rohmanir Rohiym ✦
        </div>
      </footer>

      {/* ============ BOTTOM NAV (mobile / Mini App style) ============ */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 px-3 pb-3 pb-safe">
        <div className="grid grid-cols-6 max-w-md mx-auto bg-[#FBF5EC]/95 backdrop-blur-md rounded-3xl shadow-[0_4px_32px_rgba(43,24,16,0.18)] border border-[#C9A961]/20 px-1">
          {([
            { id: "home", icon: Home, labelKey: "nav_home" as const },
            { id: "categories", icon: Grid3x3, labelKey: "nav_catalog" as const },
            { id: "recipes", icon: BookOpen, labelKey: "nav_recipes" as const },
            { id: "community", icon: Users, labelKey: "nav_community" as const },
            { id: "fav", icon: Heart, labelKey: "nav_favorites" as const },
            { id: "profile", icon: User, labelKey: "nav_profile" as const },
          ] as const).map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            const handleClick = () => {
              if (t.id === "profile" && !isTelegram) { requireTelegram("register"); return; }
              setView(t.id);
            };
            const isProfile = t.id === "profile";
            return (
              <button
                key={t.id}
                onClick={handleClick}
                className="relative flex flex-col items-center pt-2 pb-1 gap-0.5 transition"
              >
                <div className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all ${active ? "bg-[#8B2635]/10" : ""}`}>
                  {isProfile && tgUser?.photo_url ? (
                    <img src={tgUser.photo_url} alt="" className={`w-5 h-5 rounded-full object-cover ${active ? "ring-2 ring-[#C9A961]" : ""}`} />
                  ) : (
                    <Icon className={`w-5 h-5 transition-colors ${active ? "text-[#8B2635]" : "text-[#8B7355]"}`} />
                  )}
                  {t.id === "fav" && fav.length > 0 && (
                    <span className="absolute -top-1 -right-0.5 w-3.5 h-3.5 bg-[#8B2635] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                      {fav.length}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-medium transition-colors ${active ? "text-[#8B2635]" : "text-[#8B7355]"}`}>
                  {tr[t.labelKey]}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============ MODALS / DRAWERS ============ */}
      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAdd={addToCart}
          isFav={fav.includes(selected.id)}
          onToggleFav={() => toggleFav(selected.id)}
          onCheckout={() => { setSelected(null); setShowCart(true); }}
          onReview={() => requireTelegram("review")}
          onViewSeller={(id) => { setSelected(null); setSelectedSellerId(id); }}
        />
      )}

      {showCart && (
        <CartDrawer
          items={cartItems}
          total={cartTotal}
          onClose={() => setShowCart(false)}
          onUpdateQty={updateQty}
          onCheckout={checkout}
          done={checkoutDone}
        />
      )}

      {showSeller && <SellerForm onClose={() => setShowSeller(false)} onDone={() => { setShowSeller(false); setToast("Arizangiz qabul qilindi! ✓"); }} />}

      {selectedSellerId && (() => {
        const seller = getSellerById(selectedSellerId);
        if (!seller) return null;
        return (
          <SellerModal
            seller={seller}
            onClose={() => setSelectedSellerId(null)}
            onSelectProduct={(p) => { setSelectedSellerId(null); setSelected(p); }}
          />
        );
      })()}

      {storyIndex !== null && (
        <StoryViewer
          stories={stories}
          startIndex={storyIndex}
          onClose={() => setStoryIndex(null)}
          onProductClick={(pid) => {
            const p = products.find((x) => x.id === pid);
            if (p) { setSelected(p); setStoryIndex(null); }
          }}
        />
      )}

      {telegramBanner && (
        <TelegramBanner
          action={telegramBanner}
          onClose={() => setTelegramBanner(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-up">
          <div className="bg-[#2B1810] text-[#FBF5EC] px-5 py-3 rounded-full shadow-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#E4CE8A]" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function SearchBar({ query, setQuery, placeholder }: { query: string; setQuery: (s: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-[#C9A961]/30 rounded-full pl-11 pr-4 py-2.5 text-sm placeholder:text-[#8B7355] focus:outline-none focus:border-[#8B2635] focus:ring-2 focus:ring-[#8B2635]/10 transition shadow-sm"
      />
    </div>
  );
}

function HomeView(props: {
  products: Product[];
  activeCategory: string;
  setActiveCategory: (s: string) => void;
  onSelect: (p: Product) => void;
  onFav: (id: string) => void;
  favSet: Set<string>;
  onAdd: (id: string) => void;
  onOpenSeller: () => void;
  onOpenStory: (i: number) => void;
  onOpenCommunity: () => void;
  onOpenApp: () => void;
  onViewAll: () => void;
  onViewCategory: (cat: string) => void;
  query: string;
  setQuery: (s: string) => void;
  tr: ReturnType<typeof useT>;
  lang: Lang;
}) {
  const { products: list, activeCategory, onSelect, onFav, favSet, onAdd, onOpenSeller, onViewAll, onViewCategory, tr, lang } = props;

  return (
    <div className="animate-fade-up space-y-6">

      {/* CATEGORIES */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">{tr.categories_title}</h2>
          <button onClick={onViewAll} className="text-sm text-[#8B7355] hover:text-[#8B2635] flex items-center gap-1">
            {tr.see_all} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => c.id === "all" ? onViewAll() : onViewCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition text-xs font-medium ${
                  active
                    ? "bg-[#8B2635] border-[#8B2635] text-[#FBF5EC]"
                    : "bg-white border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
                }`}
              >
                <span>{c.emoji}</span>
                <span className="whitespace-nowrap">{lang === "uz" ? c.nameUz : c.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">
            {activeCategory === "all" ? tr.all_products : categories.find((c) => c.id === activeCategory)?.[lang === "uz" ? "nameUz" : "name"]}
          </h2>
          <span className="text-sm text-[#8B7355]">{tr.products_count(list.length)}</span>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#C9A961]/40">
            <div className="text-6xl mb-3">🔎</div>
            <p className="text-[#8B7355]">{tr.no_results}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {list.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={() => onSelect(p)}
                onFav={() => onFav(p.id)}
                isFav={favSet.has(p.id)}
                onAdd={() => onAdd(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMMUNITY TEASER */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D5F4E] via-[#1f4538] to-[#2D5F4E] text-[#FBF5EC] p-6 md:p-10">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'><g fill='none' stroke='%23E4CE8A' stroke-width='1'><path d='M40 0 L80 40 L40 80 L0 40 Z'/><circle cx='40' cy='40' r='12'/></g></svg>\")" }} />
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E4CE8A]/20 rounded-full px-3 py-1 mb-3 text-xs text-[#E4CE8A]">
              <Users className="w-3 h-3" /> Yangi! Hamjamiyat
            </div>
            <h3 className="font-[Cormorant_Garamond] text-3xl md:text-4xl font-semibold mb-2">
              Oshpazlar jamoasiga qo'shiling
            </h3>
            <p className="text-[#F3E8D4]/80 mb-5">
              Retseptlar, tajribalar, yangi do'stlik. O'z ishingizni baham ko'ring, boshqalarni ilhomlantiring.
            </p>
            <button onClick={props.onOpenCommunity} className="btn-gold px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2">
              Ko'rish <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="grid grid-cols-3 gap-2">
              {["👩‍🍳", "🎂", "🥟", "🍪", "🫓", "🍮"].map((e, i) => (
                <div key={i} className="w-20 h-20 rounded-2xl bg-[#FBF5EC]/10 backdrop-blur border border-[#E4CE8A]/20 flex items-center justify-center text-4xl hover:scale-110 transition">
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SELLER CTA */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B2635] to-[#6B1A27] text-[#FBF5EC] p-6 md:p-10 begim-pattern-dark">
        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#E4CE8A]/20 rounded-full px-3 py-1 mb-3 text-xs text-[#E4CE8A]">
              <Store className="w-3 h-3" /> Biznes imkoniyati
            </div>
            <h3 className="font-[Cormorant_Garamond] text-3xl md:text-4xl font-semibold mb-2">
              O'z shirinliklaringizni soting
            </h3>
            <p className="text-[#F3E8D4]/80 mb-5">
              Begim platformasida o'z do'koningizni oching — 0% komissiya birinchi oy. Minglab xaridorga yeting.
            </p>
            <button onClick={onOpenSeller} className="btn-gold px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2">
              Ariza qoldirish <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hidden md:flex justify-center">
            <div className="text-[140px]">👩‍🍳</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoriesView(props: any) {
  const { products: list, activeCategory, setActiveCategory, onSelect, onFav, favSet, onAdd, lang } = props;
  const tr = useT(lang ?? "uz");
  return (
    <div className="animate-fade-up space-y-4">
      <h1 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">{tr.catalog_title}</h1>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const active = activeCategory === c.id;
          const count = c.id === "all" ? products.length : products.filter((p: Product) => p.category === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition text-xs font-medium ${
                active
                  ? "bg-[#8B2635] border-[#8B2635] text-[#FBF5EC]"
                  : "bg-white border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
              }`}
            >
              <span>{c.emoji}</span>
              <span className="whitespace-nowrap">{lang === "uz" ? c.nameUz : c.name}</span>
              <span className={`text-[10px] ${active ? "text-[#E4CE8A]" : "text-[#8B7355]"}`}>{count}</span>
            </button>
          );
        })}
      </div>
      <div>
        <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635] mb-4">
          {activeCategory === "all" ? "Hammasi" : categories.find((c: any) => c.id === activeCategory)?.nameUz}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((p: Product) => (
            <ProductCard key={p.id} product={p} onSelect={() => onSelect(p)} onFav={() => onFav(p.id)} isFav={favSet.has(p.id)} onAdd={() => onAdd(p.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

const RECIPES = [
  {
    id: "r1", emoji: "🎂", name: "Napoleon torti", seller: "Dilnoza Yusupova", sellerEmoji: "👩‍🍳",
    desc: "Har bir qatlam — 24 soat muhlat. Kremi sut va sariyog'dan.",
    ingredients: ["un", "tuxum", "sariyog'", "sut", "qand"],
    reactions: [{ emoji: "❤️", count: 124 }, { emoji: "😍", count: 87 }, { emoji: "🔥", count: 43 }],
    views: 2840, comments: 18,
  },
  {
    id: "r2", emoji: "🥐", name: "Samsa (tandirdan)", seller: "Mohira Alimova", sellerEmoji: "👩‍🍳",
    desc: "Go'sht va piyoz — eski usul bilan. Tandirsiz ham bo'ladi.",
    ingredients: ["qo'y go'shti", "piyoz", "qora murch", "yog'", "un"],
    reactions: [{ emoji: "❤️", count: 98 }, { emoji: "👌", count: 56 }, { emoji: "🤤", count: 31 }],
    views: 1920, comments: 12,
  },
  {
    id: "r3", emoji: "🍪", name: "Gaz-payvand pechene", seller: "Zulfiya Xasanova", sellerEmoji: "👩‍🍳",
    desc: "Bolalar sevadigan — yumshoq, karamelli qatlam bilan.",
    ingredients: ["un", "qand", "tuxum", "karamel", "qorachilik"],
    reactions: [{ emoji: "😍", count: 211 }, { emoji: "❤️", count: 190 }, { emoji: "🍪", count: 77 }],
    views: 4100, comments: 34,
  },
  {
    id: "r4", emoji: "🫓", name: "Samarqand noni", seller: "Feruza Ergasheva", sellerEmoji: "👩‍🍳",
    desc: "Tandirda 25 daqiqa. Issiq suv va tuz — hammasi shu.",
    ingredients: ["bug'doy uni", "suv", "tuz", "xamirturush"],
    reactions: [{ emoji: "🔥", count: 167 }, { emoji: "❤️", count: 145 }, { emoji: "👏", count: 62 }],
    views: 3350, comments: 27,
  },
];

const MOCK_COMMENTS: Record<string, { user: string; text: string }[]> = {
  r1: [
    { user: "Zilola", text: "Ajoyib! Krem uchun necha gramm sariyog' kerak?" },
    { user: "Sardor", text: "Mening xotinim ham shunday qiladi, lekin sizniki ancha chiroyli 👌" },
  ],
  r2: [
    { user: "Mohira", text: "Tandirga qo'yish muddati necha minut?" },
    { user: "Ойша апа", text: "300 gramm go'sht uchun qancha piyoz?" },
  ],
  r3: [
    { user: "Malika", text: "Karamel qayerdan olsa bo'ladi?" },
    { user: "Feruza", text: "Bolalarim juda yaxshi ko'radi bu peheneni! 😍" },
  ],
  r4: [
    { user: "Aziza", text: "Xamirturush quruq yoki jonlimi?" },
    { user: "Muhammadali", text: "Bugun shu retsept bo'yicha pishirdim — zo'r chiqdi!" },
  ],
};

function CommentsPanel({ recipeId, count, onOpenApp }: { recipeId: string; count: number; onOpenApp: () => void }) {
  const [open, setOpen] = useState(false);
  const comments = MOCK_COMMENTS[recipeId] ?? [];
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1 text-xs transition ${open ? "text-[#8B2635]" : "text-[#8B7355] hover:text-[#8B2635]"}`}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {count} izoh
      </button>
      {open && (
        <div className="mt-3 space-y-2 border-t border-[#C9A961]/10 pt-3">
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-6 h-6 rounded-full bg-[#C9A961]/20 flex items-center justify-center text-[10px] font-bold text-[#8B2635] flex-shrink-0">
                {c.user[0]}
              </div>
              <div className="bg-[#FBF5EC] rounded-xl px-3 py-1.5 text-xs text-[#2B1810] flex-1">
                <span className="font-semibold">{c.user}: </span>{c.text}
              </div>
            </div>
          ))}
          <button
            onClick={onOpenApp}
            className="w-full text-xs text-[#8B7355] border border-dashed border-[#C9A961]/40 rounded-xl py-2 hover:border-[#C9A961] transition"
          >
            💬 Izoh qoldirish uchun kiring
          </button>
        </div>
      )}
    </div>
  );
}

function RecipesView({ onOpenApp }: { onOpenApp: () => void }) {
  const [reacted, setReacted] = useState<Record<string, string>>({});

  return (
    <div className="animate-fade-up space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">Retseptlar</h1>
        <button onClick={onOpenApp} className="text-xs text-[#8B2635] font-semibold border border-[#8B2635]/30 px-3 py-1 rounded-full hover:bg-[#8B2635]/5">
          + Qo'shish
        </button>
      </div>

      <div className="space-y-4">
        {RECIPES.map((r) => {
          const myReaction = reacted[r.id];
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">
                  {r.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#2B1810] text-sm">{r.name}</div>
                  <div className="text-xs text-[#8B7355] mt-0.5">{r.sellerEmoji} {r.seller}</div>
                </div>
                <span className="flex items-center gap-1 text-[10px] text-[#8B7355]">
                  <Eye className="w-3 h-3" />{r.views.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-[#2B1810]">{r.desc}</p>

              {/* Ingredients */}
              <div className="flex flex-wrap gap-1.5">
                {r.ingredients.map((ing) => (
                  <span key={ing} className="text-xs bg-[#FBF5EC] border border-[#C9A961]/30 px-2 py-0.5 rounded-full text-[#8B7355]">
                    {ing}
                  </span>
                ))}
              </div>

              {/* Reactions + Comments */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {r.reactions.map((rc) => (
                  <button
                    key={rc.emoji}
                    onClick={() => setReacted((prev) => ({ ...prev, [r.id]: prev[r.id] === rc.emoji ? "" : rc.emoji }))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border transition ${
                      myReaction === rc.emoji
                        ? "bg-[#8B2635]/10 border-[#8B2635]/30 text-[#8B2635]"
                        : "bg-[#FBF5EC] border-[#C9A961]/20 text-[#2B1810] hover:border-[#C9A961]"
                    }`}
                  >
                    {rc.emoji} <span>{rc.count + (myReaction === rc.emoji ? 1 : 0)}</span>
                  </button>
                ))}
                <div className="ml-auto">
                  <CommentsPanel recipeId={r.id} count={r.comments} onOpenApp={onOpenApp} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#FBF5EC] border border-dashed border-[#C9A961]/40 p-6 text-center">
        <div className="text-3xl mb-2">👩‍🍳</div>
        <p className="text-sm text-[#8B7355] mb-3">O'z retseptingizni ulashing — boshqalarni ilhomlantiring!</p>
        <button onClick={onOpenApp} className="btn-begim px-5 py-2 rounded-full text-sm font-semibold">
          Retsept qo'shish
        </button>
      </div>
    </div>
  );
}

const WEEKLY_DATA = [18, 25, 14, 32, 28, 41, 36];
const DAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-[#8B2635] to-[#C9A961] transition-all"
            style={{ height: `${(v / max) * 52}px` }}
          />
          <span className="text-[8px] text-[#8B7355]">{DAYS[i]}</span>
        </div>
      ))}
    </div>
  );
}

const CHANNEL_INFO = { name: "BeegimUz", username: "@BeegimUz", subscribers: 4820 };

function useChannelTimer() {
  const STORAGE_KEY = "bgm_channel_post_ts";
  const getRemaining = () => {
    const ts = Number(localStorage.getItem(STORAGE_KEY) || 0);
    const diff = 86400 - Math.floor((Date.now() - ts) / 1000);
    return diff > 0 ? diff : 0;
  };
  const [remaining, setRemaining] = useState(getRemaining);
  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const r = getRemaining();
      setRemaining(r);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [remaining]);
  const markPosted = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setRemaining(86400);
  };
  return { remaining, markPosted };
}

function formatCountdown(s: number) {
  const h = Math.floor(s / 3600).toString().padStart(2, "0");
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
  const sec = (s % 60).toString().padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

function StoreTab({ uz }: { uz: boolean }) {
  const { remaining, markPosted } = useChannelTimer();
  const [showDiscount, setShowDiscount] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [discountVal, setDiscountVal] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState<"payme" | "click">("payme");
  const [posted, setPosted] = useState(false);

  const handlePost = () => {
    markPosted();
    setPosted(true);
    setTimeout(() => setPosted(false), 3000);
  };

  const handleShare = () => {
    const url = `https://t.me/BeegimBot?start=shop_dilnoza`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(uz ? "Dilnoza's Kitchen — Begim bozorida 🎂" : "Dilnoza's Kitchen в магазине Begim 🎂")}`;
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, "_blank");
    }
  };

  return (
    <div className="space-y-4">
      {/* Store settings */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-[#2B1810]">{uz ? "Do'kon sozlamalari" : "Настройки магазина"}</h3>
        {[
          { label: uz?"Do'kon nomi":"Название магазина", value:"Dilnoza's Kitchen", icon:"🏪" },
          { label: uz?"Shahar":"Город", value:"Toshkent", icon:"📍" },
          { label: uz?"Telefon":"Телефон", value:"+998 90 123 45 67", icon:"📞" },
          { label: uz?"Ish vaqti":"Время работы", value:"09:00 – 21:00", icon:"🕐" },
          { label: uz?"Yetkazib berish":"Доставка", value:uz?"Bepul (50 000+ dan)":"Бесплатно (от 50 000)", icon:"🚚" },
        ].map((row) => (
          <div key={row.label} className="flex items-center gap-3 py-2 border-b border-[#C9A961]/10 last:border-0">
            <span className="text-lg">{row.icon}</span>
            <div className="flex-1">
              <div className="text-[10px] text-[#8B7355]">{row.label}</div>
              <div className="text-sm font-medium text-[#2B1810]">{row.value}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#C9A961]" />
          </div>
        ))}
      </div>

      {/* Channel post */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-xl">📣</div>
          <div className="flex-1">
            <div className="font-semibold text-sm text-[#2B1810]">{CHANNEL_INFO.name}</div>
            <div className="text-xs text-[#8B7355]">{CHANNEL_INFO.username} · {CHANNEL_INFO.subscribers.toLocaleString()} {uz ? "obunachi" : "подписчиков"}</div>
          </div>
        </div>
        <p className="text-xs text-[#8B7355] leading-relaxed">
          {uz
            ? "Mahsulotingizni kanalda e'lon qiling — minglab xaridorlar ko'radi. Har bir mahsulot 24 soatda 1 marta chiqariladi."
            : "Опубликуйте товар в канале — тысячи покупателей увидят. Каждый товар публикуется 1 раз в 24 часа."}
        </p>
        {posted ? (
          <div className="w-full bg-[#2D5F4E]/10 text-[#2D5F4E] rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
            ✓ {uz ? "Kanalga chiqarildi!" : "Опубликовано в канале!"}
          </div>
        ) : remaining > 0 ? (
          <div className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl py-3 flex items-center justify-center gap-2">
            <span className="text-sm text-[#8B7355]">{uz ? "Keyingi post:" : "Следующая публикация:"}</span>
            <span className="font-mono font-bold text-[#8B2635] text-sm">{formatCountdown(remaining)}</span>
          </div>
        ) : (
          <button type="button" onClick={handlePost}
            className="w-full bg-gradient-to-r from-[#8B2635] to-[#C9A961] text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow shadow-[#8B2635]/20">
            📣 {uz ? "Kanalga chiqarish" : "Опубликовать в канале"}
          </button>
        )}
      </div>

      {/* Discount */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏷</span>
            <span className="font-semibold text-sm text-[#2B1810]">{uz ? "Chegirma o'rnatish" : "Установить скидку"}</span>
          </div>
          <button type="button" onClick={() => setShowDiscount((v) => !v)}
            className="text-xs text-[#8B2635] font-semibold border border-[#8B2635]/20 px-3 py-1 rounded-full">
            {showDiscount ? (uz ? "Yopish" : "Закрыть") : (uz ? "O'rnatish" : "Задать")}
          </button>
        </div>
        {showDiscount && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-4 gap-2">
              {["5%","10%","15%","20%","25%","30%","40%","50%"].map((d) => (
                <button type="button" key={d} onClick={() => setDiscountVal(d)}
                  className={`py-2 rounded-xl text-xs font-bold transition ${discountVal===d?"bg-[#8B2635] text-white shadow":"bg-[#FBF5EC] text-[#2B1810]"}`}>
                  {d}
                </button>
              ))}
            </div>
            <button type="button" disabled={!discountVal}
              className="w-full bg-[#8B2635] disabled:opacity-40 text-white rounded-2xl py-2.5 text-sm font-semibold">
              {discountVal ? `${discountVal} ${uz?"chegirma qo'llash":"скидку применить"}` : (uz?"Foiz tanlang":"Выберите процент")}
            </button>
          </div>
        )}
      </div>

      {/* Share store */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xl">🔗</span>
          <div className="flex-1">
            <div className="font-semibold text-sm text-[#2B1810]">{uz ? "Do'konni ulashish" : "Поделиться магазином"}</div>
            <div className="text-xs text-[#8B7355] font-mono truncate">t.me/BeegimBot?start=shop_dilnoza</div>
          </div>
        </div>
        <button type="button" onClick={handleShare}
          className="w-full bg-[#229ED9] text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
          <span>✈️</span> {uz ? "Telegram orqali ulashish" : "Поделиться в Telegram"}
        </button>
      </div>

      {/* Withdraw */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5 space-y-4">
        <h3 className="font-semibold text-[#2B1810]">{uz ? "Hisob va to'lov" : "Счёт и выплаты"}</h3>
        <div className="bg-gradient-to-r from-[#8B2635] to-[#C9A961] rounded-2xl p-4 text-white flex items-center justify-between">
          <div>
            <div className="text-xs opacity-80">{uz ? "Hisobdagi mablag'" : "Баланс счёта"}</div>
            <div className="font-bold text-2xl mt-0.5">{formatPrice(1240000)}</div>
          </div>
          <span className="text-3xl">💳</span>
        </div>
        <div className="flex gap-2">
          {(["payme","click"] as const).map((m) => (
            <button type="button" key={m} onClick={() => setWithdrawMethod(m)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${withdrawMethod===m?"border-[#8B2635] bg-[#8B2635]/5 text-[#8B2635]":"border-[#C9A961]/30 text-[#8B7355]"}`}>
              {m === "payme" ? "🟦 Payme" : "🟨 Click"}
            </button>
          ))}
        </div>
        {showWithdraw ? (
          <div className="space-y-3">
            <input
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={uz ? "Summa (so'm)" : "Сумма (сум)"}
              type="number"
              className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635]"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowWithdraw(false)}
                className="flex-1 border border-[#C9A961]/30 rounded-2xl py-2.5 text-sm text-[#8B7355]">
                {uz ? "Bekor" : "Отмена"}
              </button>
              <button type="button"
                className="flex-1 bg-[#2D5F4E] text-white rounded-2xl py-2.5 text-sm font-semibold">
                {uz ? "So'rov yuborish" : "Отправить заявку"}
              </button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowWithdraw(true)}
            className="w-full bg-[#2D5F4E] text-white rounded-2xl py-3 text-sm font-semibold">
            {uz ? "Pul yechib olish" : "Вывести средства"} → {withdrawMethod === "payme" ? "Payme" : "Click"}
          </button>
        )}
      </div>
    </div>
  );
}

const SELLER_PRODUCTS = [
  { id: "sp1", emoji: "🎂", name: "Napoleon torti",       price: 95000, stock: 5,  orders: 34, status: "active" as const },
  { id: "sp2", emoji: "🫓", name: "Samarqand noni",       price: 18000, stock: 12, orders: 28, status: "active" as const },
  { id: "sp3", emoji: "🥟", name: "Somsa (x6)",           price: 30000, stock: 0,  orders: 25, status: "paused" as const },
  { id: "sp4", emoji: "🍪", name: "Gaz-payvand pechene",  price: 45000, stock: 8,  orders: 19, status: "active" as const },
];
const SELLER_ORDERS_DATA = [
  { id: "#BGM-1089", buyer: "Malika T.",  buyerTg: "malika_t",  product: "Napoleon torti",     total: 95000, status: "new"      as const, time: "12 min",  address: "Chilonzor, 5-uy" },
  { id: "#BGM-1085", buyer: "Sardor M.",  buyerTg: "sardor_m",  product: "Samarqand noni × 3", total: 54000, status: "preparing"as const, time: "2 soat", address: "Yunusobod, 12-uy" },
  { id: "#BGM-1081", buyer: "Nargiza X.", buyerTg: "nargiza_x", product: "Somsa × 6",          total: 30000, status: "done"     as const, time: "5 soat", address: "Mirzo Ulugbek" },
  { id: "#BGM-1076", buyer: "Dilrabo K.", buyerTg: "dilrabo_k", product: "Napoleon torti",     total: 95000, status: "done"     as const, time: "1 kun",  address: "Shayxontohur" },
  { id: "#BGM-1070", buyer: "Aziza B.",   buyerTg: "aziza_b",   product: "Pechene × 2",        total: 90000, status: "done"      as const, time: "2 kun",  address: "Sergeli" },
  { id: "#BGM-1068", buyer: "Kamola Y.", buyerTg: "kamola_y",  product: "Biskvit torti",       total: 75000, status: "cancelled" as const, time: "3 kun",  address: "Olmazor" },
];
const SELLER_REVIEWS_DATA = [
  { id: "r1", user: "Malika T.",  rating: 5, text: "Juda mazali, albatta qaytib kelaman!", time: "1 kun",  replied: false },
  { id: "r2", user: "Sardor M.",  rating: 5, text: "Haqiqiy tandir noni — tavsiya qilaman", time: "3 kun", replied: true, reply: "Rahmat! Har doim xizmatda 🙏" },
  { id: "r3", user: "Aziza B.",   rating: 4, text: "Mazali, lekin biroz kech keldi",        time: "5 kun", replied: false },
  { id: "r4", user: "Nargiza X.", rating: 5, text: "Tort juda chiroyli va mazali!",          time: "1 haf", replied: false },
];
const SELLER_CITY_DATA = [
  { city: "Toshkent",  pct: 68, count: 312 },
  { city: "Samarqand", pct: 14, count: 64 },
  { city: "Namangan",  pct: 10, count: 46 },
  { city: "Buxoro",    pct: 8,  count: 37 },
];
const BEST_HOURS = [
  { hour: "08–10", orders: 4 }, { hour: "10–12", orders: 8 }, { hour: "12–14", orders: 6 },
  { hour: "14–16", orders: 5 }, { hour: "16–18", orders: 11 },{ hour: "18–20", orders: 14 },
  { hour: "20–22", orders: 9 },
];
const SELLER_PAYMENT_HISTORY = [
  { id: "ph1", amount: 1240000, method: "payme" as const, date: "05.06.2026", status: "paid" as const },
  { id: "ph2", amount:  890000, method: "click" as const, date: "20.05.2026", status: "paid" as const },
  { id: "ph3", amount:  560000, method: "payme" as const, date: "05.05.2026", status: "paid" as const },
];
const SELLER_TIPS = [
  { icon: "📸", uz: "Sifatli foto — 3x ko'proq buyurtma",       ru: "Качественное фото = в 3 раза больше заказов" },
  { icon: "⏰", uz: "Kechki 18:00–20:00 eng faol vaqt",          ru: "18:00–20:00 — пиковое время заказов" },
  { icon: "🎁", uz: "Sovg'a qadoqlash taklif qiling",            ru: "Предлагайте подарочную упаковку" },
  { icon: "📣", uz: "Har kuni kanalga post ulashing",            ru: "Публикуйте в канале ежедневно" },
  { icon: "💬", uz: "Sharhlarga tez javob bering",               ru: "Быстро отвечайте на отзывы" },
  { icon: "🏷", uz: "Chegirmali kod — yangi mijozlarni jalb qiladi", ru: "Промокод привлекает новых клиентов" },
];

function SellerView({ lang, onBack }: { lang: Lang; onBack: () => void }) {
  const [tab, setTab] = useState<"analytics"|"orders"|"products"|"store"|"hisoblar">("analytics");
  const [period, setPeriod] = useState<"today"|"week"|"month">("week");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [products, setProducts] = useState(SELLER_PRODUCTS);
  const [orders, setOrders] = useState(SELLER_ORDERS_DATA);
  const [reviews, setReviews] = useState(SELLER_REVIEWS_DATA);
  const [replyingId, setReplyingId] = useState<string|null>(null);
  const [replyText, setReplyText] = useState("");
  const [newProduct, setNewProduct] = useState({ name:"", price:"", emoji:"🎂", desc:"", stock:"1" });
  const s = SELLER_STATS[period];
  const uz = lang === "uz";

  const periodLabels = { today: uz?"Bugun":"Сегодня", week: uz?"Hafta":"Неделя", month: uz?"Oy":"Месяц" };
  const orderStatusColor: Record<string,string> = { new:"bg-[#C9A961] animate-pulse", preparing:"bg-blue-400", done:"bg-[#2D5F4E]", cancelled:"bg-red-400" };
  const orderStatusLabel: Record<string,string> = {
    new: uz?"YANGI":"НОВЫЙ", preparing: uz?"TAYYORLANMOQDA":"ГОТОВИТСЯ",
    done: uz?"Yetkazildi":"Доставлен", cancelled: uz?"Bekor":"Отменён"
  };
  const newOrdersCount = orders.filter(o=>o.status==="new").length;

  const tabItems = [
    { id:"analytics", label: uz?"Tahlil":"Аналитика",  icon:"📊" },
    { id:"orders",    label: uz?"Buyurtma":"Заказы",    icon:"📦", badge: newOrdersCount },
    { id:"products",  label: uz?"Tovarlar":"Товары",    icon:"🛍" },
    { id:"store",     label: uz?"Do'kon":"Магазин",     icon:"🏪" },
    { id:"hisoblar",  label: uz?"Hisob":"Счёт",         icon:"💳" },
  ] as const;

  const acceptOrder  = (id: string) => setOrders(prev => prev.map(o => o.id===id ? {...o, status:"preparing" as const} : o));
  const cancelOrder  = (id: string) => setOrders(prev => prev.map(o => o.id===id ? {...o, status:"cancelled" as const} : o));
  const finishOrder  = (id: string) => setOrders(prev => prev.map(o => o.id===id ? {...o, status:"done" as const} : o));
  const updateStock  = (id: string, delta: number) =>
    setProducts(prev => prev.map(p => p.id===id ? {...p, stock: Math.max(0, p.stock+delta)} : p));
  const toggleProduct = (id: string) =>
    setProducts(prev => prev.map(p => p.id===id ? {...p, status: p.status==="active"?"paused":"active"} : p));
  const submitReply  = (id: string) => {
    setReviews(prev => prev.map(r => r.id===id ? {...r, replied:true, reply:replyText} : r));
    setReplyingId(null); setReplyText("");
  };

  const conversionRate = Math.round((s.orders / s.views) * 100);
  const avgOrderValue  = s.orders > 0 ? Math.round(s.revenue / s.orders) : 0;
  const maxHour = Math.max(...BEST_HOURS.map(h => h.orders));

  return (
    <div className="animate-fade-up max-w-2xl mx-auto pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button type="button" onClick={onBack} className="w-9 h-9 rounded-full bg-white border border-[#C9A961]/20 flex items-center justify-center shadow-sm flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-[#8B2635] rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">
            {uz ? "Mening do'konim" : "Мой магазин"}
          </h1>
          <p className="text-xs text-[#8B7355]">Dilnoza's Kitchen · 🟢 {uz?"Faol":"Активен"}</p>
        </div>
        <button type="button" onClick={() => setShowAddProduct(true)}
          className="bg-[#8B2635] text-white rounded-2xl px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow shadow-[#8B2635]/30 flex-shrink-0">
          <Plus className="w-3.5 h-3.5" /> {uz?"Qo'shish":"Добавить"}
        </button>
      </div>

      {/* Tabs — 5 tabs */}
      <div className="flex gap-1 bg-white border border-[#C9A961]/20 rounded-2xl p-1 shadow-sm mb-5 overflow-x-auto no-scrollbar">
        {tabItems.map((t) => (
          <button type="button" key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex-1 min-w-[52px] py-2 rounded-xl text-[10px] font-semibold transition flex flex-col items-center gap-0.5 relative ${tab===t.id?"bg-[#8B2635] text-white shadow":"text-[#8B7355]"}`}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {"badge" in t && t.badge > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#C9A961] text-[#2B1810] text-[8px] font-bold rounded-full flex items-center justify-center">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {tab === "analytics" && (
        <div className="space-y-4">
          <div className="flex gap-1 bg-[#FBF5EC] rounded-xl p-1">
            {(["today","week","month"] as const).map(p => (
              <button type="button" key={p} onClick={() => setPeriod(p)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${period===p?"bg-white text-[#8B2635] shadow-sm":"text-[#8B7355]"}`}>
                {periodLabels[p]}
              </button>
            ))}
          </div>

          {/* 5 KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:uz?"Ko'rishlar":"Просмотры",   value:s.views.toLocaleString(),    icon:"👁",  color:"from-[#1a3a5c] to-[#2563eb]" },
              { label:uz?"Buyurtmalar":"Заказы",      value:s.orders.toString(),          icon:"📦",  color:"from-[#2D5F4E] to-[#16a34a]" },
              { label:uz?"Daromad":"Выручка",         value:formatPrice(s.revenue),       icon:"💰",  color:"from-[#8B2635] to-[#C9A961]" },
              { label:uz?"Konversiya":"Конверсия",    value:`${conversionRate}%`,         icon:"📈",  color:"from-[#6B3F1A] to-[#C9A961]" },
            ].map(k => (
              <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white`}>
                <div className="text-xl mb-1">{k.icon}</div>
                <div className="font-bold text-base">{k.value}</div>
                <div className="text-[9px] opacity-80 mt-0.5">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Avg order value */}
          <div className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm px-5 py-3 flex items-center justify-between">
            <span className="text-sm text-[#8B7355]">{uz?"O'rtacha buyurtma":"Средний чек"}</span>
            <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#8B2635]">{formatPrice(avgOrderValue)}</span>
          </div>

          {/* Weekly chart */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h3 className="font-semibold text-[#2B1810] text-sm">{uz?"Haftalik buyurtmalar":"Заказы за неделю"}</h3>
              <span className="text-xs text-[#2D5F4E] font-semibold">↑ 18%</span>
            </div>
            <MiniChart data={WEEKLY_DATA} />
          </div>

          {/* Best hours */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <h3 className="font-semibold text-[#2B1810] text-sm mb-3">{uz?"Eng faol soatlar":"Пиковые часы заказов"}</h3>
            <div className="flex items-end gap-1 h-14">
              {BEST_HOURS.map(h => {
                const pct = Math.round((h.orders / maxHour) * 100);
                const isPeak = h.orders === maxHour;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex items-end" style={{height:"40px"}}>
                      <div className={`w-full rounded-t-md transition-all ${isPeak?"bg-[#8B2635]":"bg-[#C9A961]/40"}`} style={{height:`${pct}%`}}/>
                    </div>
                    <span className="text-[7px] text-[#8B7355] leading-none">{h.hour.split("–")[0]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#8B7355] mt-2">
              ⭐ {uz?"Eng yaxshi vaqt: 18:00–20:00":"Лучшее время: 18:00–20:00"}
            </p>
          </div>

          {/* Audience by city */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <h3 className="font-semibold text-[#2B1810] text-sm mb-3">{uz?"Auditoriya (shahar)":"Аудитория по городам"}</h3>
            <div className="space-y-2.5">
              {SELLER_CITY_DATA.map(c => (
                <div key={c.city}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-[#2B1810]">{c.city}</span>
                    <span className="text-[#8B7355]">{c.count} {uz?"ta":"чел."} · {c.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-[#FBF5EC] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#8B2635] to-[#C9A961] rounded-full" style={{width:`${c.pct}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <h3 className="font-semibold text-[#2B1810] text-sm mb-3">{uz?"Top mahsulotlar":"Топ товары"}</h3>
            <div className="space-y-3">
              {SELLER_STATS.topProducts.map((p, i) => {
                const pct = Math.round((p.orders / SELLER_STATS.topProducts[0].orders) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center gap-2 mb-1">
                      <span>{["🥇","🥈","🥉"][i] ?? "·"}</span>
                      <span className="flex-1 text-sm text-[#2B1810] truncate">{p.name}</span>
                      <span className="text-xs text-[#8B7355]">{p.orders} {uz?"ta":"шт"}</span>
                      <span className="text-xs font-semibold text-[#8B2635]">{formatPrice(p.revenue)}</span>
                    </div>
                    <div className="h-1.5 bg-[#FBF5EC] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${i===0?"bg-[#8B2635]":i===1?"bg-[#C9A961]":"bg-[#2D5F4E]"}`} style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-[#2B1810] to-[#4a2a18] rounded-3xl p-5 text-[#F3E8D4]">
            <h3 className="font-semibold text-[#C9A961] text-sm mb-3">💡 {uz?"Maslahatlar":"Советы"}</h3>
            <div className="space-y-2">
              {SELLER_TIPS.map(t => (
                <div key={t.uz} className="flex items-start gap-2.5 text-xs">
                  <span className="text-base flex-shrink-0 mt-0.5">{t.icon}</span>
                  <span className="text-[#F3E8D4]/80 leading-relaxed">{uz?t.uz:t.ru}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── ORDERS ── */}
      {tab === "orders" && (
        <div className="space-y-3">
          {newOrdersCount > 0 && (
            <div className="bg-[#C9A961]/15 border border-[#C9A961]/40 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-sm">🔔</span>
              <span className="text-sm font-semibold text-[#8B5E00]">{newOrdersCount} {uz?"ta yangi buyurtma!":"новых заказа!"}</span>
            </div>
          )}
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${orderStatusColor[o.status]}`}/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#2B1810]">{o.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${o.status==="new"?"bg-[#C9A961]/20 text-[#8B5E00]":o.status==="preparing"?"bg-blue-100 text-blue-700":o.status==="cancelled"?"bg-red-100 text-red-600":"bg-[#2D5F4E]/10 text-[#2D5F4E]"}`}>
                      {orderStatusLabel[o.status]}
                    </span>
                  </div>
                  <div className="text-xs text-[#8B7355]">{o.buyer} · {o.product}</div>
                  <div className="text-xs text-[#8B7355]">📍 {o.address} · {o.time}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-sm text-[#8B2635]">{formatPrice(o.total)}</div>
                </div>
              </div>
              {o.status === "new" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => acceptOrder(o.id)}
                    className="flex-1 bg-[#2D5F4E] text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                    ✓ {uz?"Qabul qilish":"Принять"}
                  </button>
                  <button type="button" onClick={() => {
                    if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(`https://t.me/${o.buyerTg}`);
                  }}
                    className="flex-1 bg-[#229ED9] text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1.5">
                    ✈ {uz?"Xabar":"Написать"}
                  </button>
                  <button type="button" onClick={() => cancelOrder(o.id)}
                    className="w-10 bg-red-50 text-red-500 rounded-xl py-2 text-xs font-bold flex items-center justify-center">
                    ✕
                  </button>
                </div>
              )}
              {o.status === "preparing" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => finishOrder(o.id)}
                    className="flex-1 bg-[#8B2635] text-white rounded-xl py-2 text-xs font-bold">
                    📦 {uz?"Yetkazildi":"Доставлено"}
                  </button>
                  <button type="button" onClick={() => {
                    if (window.Telegram?.WebApp) window.Telegram.WebApp.openTelegramLink(`https://t.me/${o.buyerTg}`);
                  }}
                    className="flex-1 bg-[#229ED9] text-white rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-1">
                    ✈ {uz?"Xabar":"Написать"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {tab === "products" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setShowAddProduct(true)}
            className="w-full border-2 border-dashed border-[#C9A961]/40 rounded-2xl py-3.5 text-sm text-[#8B7355] flex items-center justify-center gap-2 hover:border-[#C9A961] transition">
            <Plus className="w-4 h-4"/> {uz?"Yangi mahsulot qo'shish":"Добавить новый товар"}
          </button>
          {products.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">{p.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#2B1810]">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-bold text-[#8B2635]">{formatPrice(p.price)}</span>
                    <span className="text-[9px] text-[#8B7355]">{p.orders} {uz?"buyurtma":"заказов"}</span>
                  </div>
                </div>
                <button type="button" onClick={() => toggleProduct(p.id)}
                  className={`w-10 h-5 rounded-full transition relative flex-shrink-0 ${p.status==="active"?"bg-[#2D5F4E]":"bg-gray-200"}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.status==="active"?"left-5":"left-0.5"}`}/>
                </button>
              </div>
              {/* Stock control */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#C9A961]/10">
                <span className="text-xs text-[#8B7355] flex-1">{uz?"Qoldi":"Остаток"}</span>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateStock(p.id,-1)}
                    className="w-7 h-7 rounded-full border border-[#C9A961]/30 flex items-center justify-center text-[#8B7355] hover:bg-[#FBF5EC] transition">
                    <Minus className="w-3 h-3"/>
                  </button>
                  <span className={`w-8 text-center text-sm font-bold ${p.stock===0?"text-red-500":"text-[#2B1810]"}`}>{p.stock}</span>
                  <button type="button" onClick={() => updateStock(p.id,1)}
                    className="w-7 h-7 rounded-full border border-[#C9A961]/30 flex items-center justify-center text-[#8B7355] hover:bg-[#FBF5EC] transition">
                    <Plus className="w-3 h-3"/>
                  </button>
                </div>
                {p.stock === 0 && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{uz?"TUGADI":"НЕТ"}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DO'KON ── */}
      {tab === "store" && (
        <div className="space-y-4">
          <StoreTab uz={uz} />

          {/* Reviews with replies */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h3 className="font-semibold text-[#2B1810] text-sm">{uz?"Mijozlar sharhlari":"Отзывы покупателей"}</h3>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 fill-[#C9A961] text-[#C9A961]"/>)}
                <span className="text-xs font-bold text-[#2B1810] ml-1">4.8</span>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="space-y-2">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FBF5EC] flex items-center justify-center text-sm font-bold text-[#8B2635] flex-shrink-0">{r.user[0]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#2B1810]">{r.user}</span>
                        <div className="flex gap-0.5">{Array.from({length:5}).map((_,i)=><Star key={i} className={`w-2.5 h-2.5 ${i<r.rating?"fill-[#C9A961] text-[#C9A961]":"text-[#C9A961]/30"}`}/>)}</div>
                        <span className="text-[10px] text-[#8B7355] ml-auto">{r.time}</span>
                      </div>
                      <p className="text-xs text-[#8B7355] mt-0.5">{r.text}</p>
                      {r.replied && r.reply && (
                        <div className="mt-2 bg-[#FBF5EC] rounded-xl px-3 py-2">
                          <div className="text-[10px] font-bold text-[#8B2635] mb-0.5">🏪 {uz?"Sotuvchidan javob":"Ответ продавца"}</div>
                          <p className="text-xs text-[#2B1810]">{r.reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {!r.replied && (
                    replyingId === r.id ? (
                      <div className="ml-11 space-y-2">
                        <input value={replyText} onChange={e=>setReplyText(e.target.value)}
                          placeholder={uz?"Javob yozing...":"Напишите ответ..."}
                          className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#8B2635]"/>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => submitReply(r.id)} disabled={!replyText.trim()}
                            className="flex-1 bg-[#8B2635] disabled:opacity-40 text-white rounded-xl py-1.5 text-xs font-bold">
                            {uz?"Yuborish":"Отправить"}
                          </button>
                          <button type="button" onClick={() => {setReplyingId(null);setReplyText("");}}
                            className="flex-1 bg-[#FBF5EC] text-[#8B7355] rounded-xl py-1.5 text-xs font-bold">
                            {uz?"Bekor":"Отмена"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setReplyingId(r.id)}
                        className="ml-11 text-xs text-[#8B2635] font-semibold flex items-center gap-1 hover:underline">
                        ↩ {uz?"Javob berish":"Ответить"}
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISOBLAR ── */}
      {tab === "hisoblar" && (
        <div className="space-y-4">
          {/* Balance card */}
          <div className="bg-gradient-to-br from-[#8B2635] to-[#C9A961] rounded-3xl p-5 text-white">
            <div className="text-xs opacity-80 mb-1">{uz?"Joriy balans":"Текущий баланс"}</div>
            <div className="font-[Cormorant_Garamond] text-4xl font-bold">1 240 000</div>
            <div className="text-sm opacity-80">so'm</div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/20">
              <div>
                <div className="text-[10px] opacity-70">{uz?"Bu oy daromad":"Доход за месяц"}</div>
                <div className="font-bold text-sm">7 200 000 so'm</div>
              </div>
              <div>
                <div className="text-[10px] opacity-70">{uz?"Komissiya (5%)":"Комиссия (5%)"}</div>
                <div className="font-bold text-sm">360 000 so'm</div>
              </div>
            </div>
          </div>

          {/* Withdraw */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-[#2B1810] text-sm">{uz?"Pul yechib olish":"Вывод средств"}</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["payme","click"] as const).map(m => (
                <div key={m} className={`flex items-center gap-2 p-3 rounded-xl border-2 ${m==="payme"?"border-blue-300 bg-blue-50":"border-yellow-300 bg-yellow-50"}`}>
                  <span className="text-lg">{m==="payme"?"🟦":"🟨"}</span>
                  <div>
                    <div className="text-xs font-bold text-[#2B1810]">{m==="payme"?"Payme":"Click"}</div>
                    <div className="text-[10px] text-[#8B7355]">{m==="payme"?"9860 *** *** 9012":"+998 90 *** ** 67"}</div>
                  </div>
                </div>
              ))}
            </div>
            <input placeholder={uz?"Summa (so'm)":"Сумма (сум)"} type="number"
              className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635]"/>
            <button type="button" className="w-full bg-[#2D5F4E] text-white rounded-2xl py-3 text-sm font-semibold">
              {uz?"So'rov yuborish":"Отправить заявку"}
            </button>
          </div>

          {/* Payment history */}
          <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm p-5">
            <h3 className="font-semibold text-[#2B1810] text-sm mb-3">{uz?"To'lov tarixi":"История выплат"}</h3>
            <div className="space-y-3">
              {SELLER_PAYMENT_HISTORY.map(ph => (
                <div key={ph.id} className="flex items-center gap-3 py-2 border-b border-[#C9A961]/10 last:border-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${ph.method==="payme"?"bg-blue-50":"bg-yellow-50"}`}>
                    {ph.method==="payme"?"🟦":"🟨"}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#2B1810]">{ph.method==="payme"?"Payme":"Click"}</div>
                    <div className="text-xs text-[#8B7355]">{ph.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-[#2D5F4E]">+{formatPrice(ph.amount)}</div>
                    <div className="text-[9px] bg-[#2D5F4E]/10 text-[#2D5F4E] px-1.5 py-0.5 rounded-full">✓</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Sheet */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowAddProduct(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
          <div className="relative w-full bg-[#FBF5EC] rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#8B2635]">{uz?"Yangi mahsulot":"Новый товар"}</h3>
              <button type="button" onClick={() => setShowAddProduct(false)} className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <X className="w-4 h-4 text-[#8B7355]"/>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {["🎂","🫓","🥟","🍪","🥧","🍮","🍞","🥐"].map(e => (
                <button type="button" key={e} onClick={() => setNewProduct(p=>({...p,emoji:e}))}
                  className={`h-12 rounded-xl text-2xl flex items-center justify-center transition ${newProduct.emoji===e?"bg-[#8B2635] shadow":"bg-white border border-[#C9A961]/20"}`}>
                  {e}
                </button>
              ))}
            </div>
            {[
              { key:"name",  label:uz?"Nomi":"Название",   placeholder:uz?"Napoleon torti":"Наполеон" },
              { key:"price", label:uz?"Narx":"Цена",       placeholder:"95000" },
              { key:"stock", label:uz?"Miqdori":"Кол-во",  placeholder:"5" },
              { key:"desc",  label:uz?"Tavsif":"Описание", placeholder:uz?"Qisqa tavsif...":"Краткое описание..." },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs text-[#8B7355] font-medium block mb-1">{f.label}</label>
                <input value={(newProduct as any)[f.key]} onChange={e=>setNewProduct(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  className="w-full bg-white border border-[#C9A961]/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635] transition"/>
              </div>
            ))}
            <button type="button"
              onClick={() => {
                if (newProduct.name && newProduct.price) {
                  setProducts(p => [...p, {
                    id: `sp${Date.now()}`, emoji: newProduct.emoji,
                    name: newProduct.name, price: Number(newProduct.price),
                    stock: Number(newProduct.stock)||1, orders: 0, status: "active" as const
                  }]);
                }
                setShowAddProduct(false);
                setNewProduct({name:"",price:"",emoji:"🎂",desc:"",stock:"1"});
              }}
              className="w-full bg-[#8B2635] text-white rounded-2xl py-3.5 font-semibold text-sm shadow-lg shadow-[#8B2635]/20">
              {uz?"Saqlash va chiqarish":"Сохранить и опубликовать"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FavoritesView(props: any) {
  const { products: list, onSelect, onFav, favSet, onAdd } = props;
  return (
    <div className="animate-fade-up space-y-6">
      <h1 className="font-[Cormorant_Garamond] text-4xl font-semibold text-[#8B2635]">Sevimlilar</h1>
      {list.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#C9A961]/40">
          <div className="text-6xl mb-3">💝</div>
          <p className="text-[#8B7355] mb-1">Hozircha sevimlilar yo'q</p>
          <p className="text-xs text-[#8B7355]">Yurakchani bosib saqlang</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {list.map((p: Product) => (
            <ProductCard key={p.id} product={p} onSelect={() => onSelect(p)} onFav={() => onFav(p.id)} isFav={favSet.has(p.id)} onAdd={() => onAdd(p.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

const SELLER_STATS = {
  today: { views: 142, orders: 3, revenue: 285000 },
  week: { views: 981, orders: 22, revenue: 1840000 },
  month: { views: 3640, orders: 87, revenue: 7200000 },
  topProducts: [
    { name: "Napoleon torti", emoji: "🎂", orders: 34, revenue: 3060000 },
    { name: "Samarqand noni", emoji: "🫓", orders: 28, revenue: 504000 },
    { name: "Somsa (x6)", emoji: "🥟", orders: 25, revenue: 750000 },
  ],
};


function ProfileView({ onOpenSeller, tgUser, tr, lang, onNavigate, setLang }: {
  onOpenSeller: () => void;
  tgUser: any;
  tr: ReturnType<typeof useT>;
  lang: Lang;
  onNavigate: (v: View) => void;
  setLang?: (l: Lang) => void;
}) {
  const [showOrders, setShowOrders] = useState(false);
  const [isSeller] = useState(true); // demo: always show seller panel
  const orders = [
    { id: "#BGM-1024", date: "12 mart 2026", items: "Samarqand noni × 2", total: 36000, status: "Yetkazildi" },
    { id: "#BGM-998", date: "8 mart 2026", items: "Napoleon torti × 1", total: 185000, status: "Yetkazildi" },
  ];
  const displayName = tgUser ? `${tgUser.first_name}${tgUser.last_name ? " " + tgUser.last_name : ""}` : "Mehmon";
  const displayUsername = tgUser?.username ? `@${tgUser.username}` : "+998 90 ••• •• ••";

  return (
    <div className="animate-fade-up space-y-4 max-w-2xl mx-auto">

      {/* Profile header */}
      <div className="bg-white rounded-3xl p-5 border border-[#C9A961]/20 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B2635] to-[#6B1A27] flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
          {tgUser?.photo_url ? <img src={tgUser.photo_url} alt="" className="w-full h-full object-cover" /> : <span>👤</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">{displayName}</h1>
          <p className="text-sm text-[#8B7355]">{displayUsername}</p>
          {tgUser?.is_premium && (
            <span className="inline-block mt-1 text-[10px] bg-gradient-to-r from-[#C9A961] to-[#E4CE8A] text-[#2B1810] font-bold px-2 py-0.5 rounded-full">⭐ PREMIUM</span>
          )}
          {isSeller && (
            <span className="inline-block mt-1 ml-1 text-[10px] bg-[#2D5F4E] text-[#FBF5EC] font-bold px-2 py-0.5 rounded-full">
              🏪 {lang === "uz" ? "Sotuvchi" : "Продавец"}
            </span>
          )}
        </div>
      </div>

      {/* Orders */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm overflow-hidden">
        <button onClick={() => setShowOrders((v) => !v)} className="w-full flex items-center gap-3 p-4 hover:bg-[#FBF5EC] transition text-left">
          <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#8B2635]" />
          </div>
          <div className="flex-1 font-medium text-[#2B1810]">{tr.profile_orders}</div>
          <span className="text-xs text-[#8B7355] mr-1">{orders.length}</span>
          <ChevronRight className={`w-4 h-4 text-[#8B7355] transition-transform ${showOrders ? "rotate-90" : ""}`} />
        </button>
        {showOrders && (
          <div className="border-t border-[#C9A961]/10 divide-y divide-[#C9A961]/10">
            {orders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#2B1810]">{o.id}</div>
                  <div className="text-xs text-[#8B7355]">{o.items} · {o.date}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm text-[#8B2635]">{formatPrice(o.total)}</div>
                  <div className="text-xs text-[#2D5F4E] flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3 h-3" /> {o.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My content */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm overflow-hidden divide-y divide-[#C9A961]/10">
        {[
          { icon: Heart, label: lang === "uz" ? "Mening sevimlilarim" : "Мои избранные", onClick: () => onNavigate("fav") },
          { icon: Users, label: lang === "uz" ? "Mening fikrlarim" : "Мои отзывы", onClick: () => onNavigate("community") },
          { icon: BookOpen, label: lang === "uz" ? "Mening retseptlarim" : "Мои рецепты", onClick: () => onNavigate("recipes") },
          ...(isSeller ? [{ icon: Store, label: lang === "uz" ? "Sotuvchi paneli / Do'konim" : "Панель продавца / Магазин", onClick: () => onNavigate("seller" as View), badge: "" }] : [{ icon: Store, label: tr.profile_become_seller, onClick: onOpenSeller, badge: lang === "uz" ? "YANGI" : "НОВОЕ" }]),
        ].map((m) => {
          const Icon = m.icon;
          return (
            <button key={m.label} onClick={m.onClick} className="w-full flex items-center gap-3 p-4 hover:bg-[#FBF5EC] transition text-left">
              <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#8B2635]" />
              </div>
              <div className="flex-1 font-medium text-[#2B1810]">{m.label}</div>
              {"badge" in m && m.badge && <span className="text-[10px] bg-[#8B2635] text-[#FBF5EC] px-2 py-0.5 rounded-full font-bold">{m.badge as string}</span>}
              <ChevronRight className="w-4 h-4 text-[#8B7355]" />
            </button>
          );
        })}
      </div>

      {/* Settings */}
      <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-sm overflow-hidden divide-y divide-[#C9A961]/10">
        <button onClick={() => {}} className="w-full flex items-center gap-3 p-4 hover:bg-[#FBF5EC] transition text-left">
          <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center">
            <Send className="w-5 h-5 text-[#8B2635]" />
          </div>
          <div className="flex-1 font-medium text-[#2B1810]">{lang === "uz" ? "Telegram kanalimiz" : "Наш Telegram канал"}</div>
          <ChevronRight className="w-4 h-4 text-[#8B7355]" />
        </button>
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">🌐</div>
          <div className="flex-1 font-medium text-[#2B1810]">{lang === "uz" ? "Til" : "Язык"}</div>
          <div className="flex gap-1 bg-[#FBF5EC] rounded-full p-0.5 border border-[#C9A961]/20">
            {(["uz", "ru"] as const).map((l) => (
              <button key={l} onClick={() => setLang?.(l)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${lang === l ? "bg-[#8B2635] text-white" : "text-[#8B7355]"}`}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product, onSelect, onFav, isFav, onAdd
}: {
  product: Product;
  onSelect: () => void;
  onFav: () => void;
  isFav: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="product-card bg-white rounded-2xl overflow-hidden border border-[#C9A961]/20 flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-[#FBF5EC] cursor-pointer" onClick={onSelect}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md transition hover:scale-110"
        >
          <Heart className={`w-4 h-4 ${isFav ? "fill-[#8B2635] text-[#8B2635]" : "text-[#2B1810]"}`} />
        </button>
        {product.badges && (
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges.map((b) => (
              <span
                key={b}
                className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  b === "Хит" ? "bg-[#8B2635] text-[#FBF5EC]" :
                  b === "Premium" ? "bg-[#2B1810] text-[#E4CE8A]" :
                  b === "Halol" ? "bg-[#2D5F4E] text-[#FBF5EC]" :
                  b === "Сезон" ? "bg-[#C9A961] text-[#2B1810]" :
                  "bg-[#E4CE8A] text-[#2B1810]"
                }`}
              >
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-[#8B7355] mb-1">
          <span>{product.sellerAvatar}</span>
          <span className="truncate">{product.seller}</span>
        </div>
        <h3 className="font-semibold text-[#2B1810] text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1 text-xs">
          <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
          <span className="font-semibold text-[#2B1810]">{product.rating}</span>
          <span className="text-[#8B7355]">({product.reviewsCount})</span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div>
            {product.oldPrice && (
              <div className="text-xs text-[#8B7355] line-through">{formatPrice(product.oldPrice)}</div>
            )}
            <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#8B2635] leading-none">
              {formatPrice(product.price)}
            </div>
          </div>
          <button
            onClick={onAdd}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full btn-begim flex items-center justify-center flex-shrink-0"
            aria-label="Savatga"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({
  product, onClose, onAdd, isFav, onToggleFav, onCheckout, onReview, onViewSeller
}: {
  product: Product;
  onClose: () => void;
  onAdd: (id: string) => void;
  isFav: boolean;
  onToggleFav: () => void;
  onCheckout?: () => void;
  onReview: () => void;
  onViewSeller?: (sellerId: string) => void;
}) {
  const productReviews = reviews.filter((r) => r.productId === product.id);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#2B1810]/60 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full md:max-w-3xl max-h-[92vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto begim-scroll">
          <div className="relative aspect-[16/10] md:aspect-[16/9] bg-[#F3E8D4]">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FBF5EC] to-transparent" />
          </div>

          <div className="p-5 md:p-8 space-y-5 -mt-4 relative">
            <div>
              {product.badges && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {product.badges.map((b) => (
                    <span key={b} className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#2D5F4E] text-[#FBF5EC]">{b}</span>
                  ))}
                </div>
              )}
              <h2 className="font-[Cormorant_Garamond] text-3xl md:text-4xl font-semibold text-[#8B2635] leading-tight">
                {product.name}
              </h2>
              <p className="text-sm text-[#8B7355] italic mt-0.5">{product.nameUz}</p>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-[#C9A961] text-[#C9A961]" />
                <span className="font-semibold">{product.rating}</span>
                <button onClick={onReview} className="text-[#8B2635] hover:underline">· {product.reviewsCount} ta sharh</button>
              </div>
              <span className="text-[#C9A961]">✦</span>
              <span className="text-[#8B7355]">{product.sellerCity}</span>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#FBF5EC] flex items-center justify-center text-2xl">
                {product.sellerAvatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-[#2B1810]">{product.seller}</div>
                <div className="text-xs text-[#8B7355] flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {product.sellerCity} · Tekshirilgan sotuvchi
                </div>
              </div>
              <button
                onClick={() => product.sellerId && onViewSeller?.(product.sellerId)}
                className="text-xs font-semibold text-[#8B2635] border border-[#8B2635] rounded-full px-3 py-1.5 hover:bg-[#8B2635] hover:text-[#FBF5EC] transition">
                Do'kon →
              </button>
            </div>

            <p className="text-[#2B1810] leading-relaxed">{product.description}</p>

            {/* Reviews section with CTA */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#8B2635]">Sharhlar</h3>
                <button
                  onClick={onReview}
                  className="text-xs font-semibold text-[#8B2635] border border-[#8B2635] rounded-full px-3 py-1.5 hover:bg-[#8B2635] hover:text-[#FBF5EC] transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Sharh yozish
                </button>
              </div>
              <div className="space-y-3">
                {productReviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-[#FBF5EC] flex items-center justify-center text-sm">{r.avatar}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{r.author}</div>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "fill-[#C9A961] text-[#C9A961]" : "text-[#C9A961]/30"}`} />
                          ))}
                          <span className="text-xs text-[#8B7355] ml-1">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-[#2B1810] leading-relaxed">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer */}
        <div className="border-t border-[#C9A961]/20 bg-[#FBF5EC] p-4 pb-safe flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-[#8B7355]">Narxi</div>
            <div className="font-[Cormorant_Garamond] text-2xl font-bold text-[#8B2635] leading-tight">
              {formatPrice(product.price * qty)}
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-[#C9A961]/30 rounded-full p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-full hover:bg-[#FBF5EC] flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-semibold text-sm">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-full hover:bg-[#FBF5EC] flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <button onClick={onToggleFav} className="w-11 h-11 rounded-full border border-[#C9A961]/30 bg-white flex items-center justify-center">
            <Heart className={`w-5 h-5 ${isFav ? "fill-[#8B2635] text-[#8B2635]" : "text-[#2B1810]"}`} />
          </button>
          <button
            onClick={() => { for (let i = 0; i < qty; i++) onAdd(product.id); onCheckout?.(); }}
            className="btn-begim px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" /> Savatga
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({
  items, total, onClose, onUpdateQty, onCheckout, done
}: {
  items: any[]; total: number; onClose: () => void;
  onUpdateQty: (id: string, d: number) => void;
  onCheckout: () => void; done: boolean;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-[#2B1810]/60 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full md:max-w-md h-[85vh] md:h-[90vh] md:mr-4 md:my-4 md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#C9A961]/20 flex items-center justify-between">
          <div>
            <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">Savat</h2>
            <p className="text-xs text-[#8B7355]">{items.length} ta mahsulot</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div className="animate-fade-up">
              <div className="w-20 h-20 rounded-full bg-[#2D5F4E] flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-[#FBF5EC]" />
              </div>
              <h3 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635] mb-2">Buyurtma qabul qilindi!</h3>
              <p className="text-sm text-[#8B7355]">Sotuvchi tez orada siz bilan bog'lanadi 🤲</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6 text-center">
            <div>
              <div className="text-6xl mb-3">🛒</div>
              <p className="text-[#8B7355] mb-4">Savat bo'sh</p>
              <button onClick={onClose} className="btn-begim px-5 py-2.5 rounded-full text-sm font-semibold">Xaridni boshlash</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto begim-scroll p-4 space-y-3">
              {items.map((it: any) => (
                <div key={it.id} className="bg-white rounded-2xl p-3 border border-[#C9A961]/20 flex gap-3">
                  <img src={it.product.image} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#8B7355] flex items-center gap-1">
                      <span>{it.product.sellerAvatar}</span>
                      <span className="truncate">{it.product.seller}</span>
                    </div>
                    <h4 className="font-semibold text-sm text-[#2B1810] truncate">{it.product.name}</h4>
                    <div className="font-[Cormorant_Garamond] text-lg font-bold text-[#8B2635] leading-tight">
                      {formatPrice(it.product.price * it.qty)}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={() => onUpdateQty(it.id, -1)} className="w-7 h-7 rounded-full border border-[#C9A961]/30 flex items-center justify-center">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{it.qty}</span>
                      <button onClick={() => onUpdateQty(it.id, 1)} className="w-7 h-7 rounded-full border border-[#C9A961]/30 flex items-center justify-center">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#C9A961]/20 p-4 pb-safe bg-white/50">
              <div className="flex justify-between text-sm mb-1 text-[#8B7355]">
                <span>Mahsulotlar</span><span>{items.length} ta</span>
              </div>
              <div className="flex justify-between text-sm mb-3 text-[#8B7355]">
                <span>Yetkazib berish</span><span className="text-[#2D5F4E] font-semibold">Bepul</span>
              </div>
              <div className="flex justify-between items-baseline mb-4 pt-3 border-t border-[#C9A961]/20">
                <span className="font-semibold">Jami</span>
                <span className="font-[Cormorant_Garamond] text-3xl font-bold text-[#8B2635]">{formatPrice(total)}</span>
              </div>
              <button type="button" onClick={onCheckout} className="btn-begim w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> Buyurtma berish
              </button>
              <p className="text-[10px] text-center text-[#8B7355] mt-2">
                ✦ Bismillahir Rohmanir Rohiym ✦ Halol to'lov
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SellerForm({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", city: "", product: "", about: "" });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#2B1810]/60 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full md:max-w-lg md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-[#C9A961]/20 flex items-center justify-between">
          <div>
            <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">Sotuvchi bo'lish</h2>
            <p className="text-xs text-[#8B7355]">O'z shirinliklaringizni Begim'da soting</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {[
            { key: "name", label: "Ismingiz", placeholder: "Masalan: Malika opa", type: "text" },
            { key: "phone", label: "Telefon raqam", placeholder: "+998 90 123 45 67", type: "tel" },
            { key: "city", label: "Shahar", placeholder: "Toshkent", type: "text" },
            { key: "product", label: "Asosiy mahsulotingiz", placeholder: "Tortlar, somsa, non...", type: "text" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B2635] focus:ring-2 focus:ring-[#8B2635]/10 transition"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">O'zingiz haqingizda</label>
            <textarea
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              rows={3}
              placeholder="Necha yildan beri pishirasiz? Nima uchun aynan sizning shirinligingiz?"
              className="w-full bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B2635] focus:ring-2 focus:ring-[#8B2635]/10 transition resize-none"
            />
          </div>

          <div className="bg-[#2D5F4E]/10 border border-[#2D5F4E]/20 rounded-2xl p-4 flex gap-3">
            <Shield className="w-5 h-5 text-[#2D5F4E] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#2B1810]">
              <b>Birinchi oy 0% komissiya.</b> Biz faqat halol va sifatli mahsulotlarni qabul qilamiz. Arizangiz 24 soat ichida ko'rib chiqiladi.
            </div>
          </div>
        </div>
        <div className="border-t border-[#C9A961]/20 p-4 pb-safe bg-white/50">
          <button
            onClick={onDone}
            disabled={!form.name || !form.phone}
            className="btn-begim w-full py-3.5 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Arizani yuborish
          </button>
        </div>
      </div>
    </div>
  );
}

import type { Seller } from "./data/sellers";

function SellerModal({
  seller, onClose, onSelectProduct
}: {
  seller: Seller;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}) {
  const sellerProducts = products.filter((p) => p.sellerId === seller.id);
  const sellerReviews = reviews.filter((r) =>
    sellerProducts.some((p) => p.id === r.productId)
  ).slice(0, 5);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2B1810]/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full max-h-[94vh] rounded-t-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto begim-scroll">
          <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1A27] text-[#FBF5EC] p-6 pb-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#FBF5EC]/20 flex items-center justify-center text-4xl flex-shrink-0 ring-2 ring-[#C9A961]/40">
                {seller.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>{seller.name}</h2>
                  {seller.verified && <CheckCircle2 className="w-4 h-4 text-[#E4CE8A]" />}
                </div>
                {seller.badge && (
                  <span className="inline-block text-[10px] font-bold bg-[#C9A961] text-[#2B1810] px-2 py-0.5 rounded-full mb-1">{seller.badge}</span>
                )}
                <div className="text-xs text-[#F3E8D4]/80 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {seller.city} · {seller.speciality}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white -mt-5 mx-4 rounded-2xl shadow-md grid grid-cols-4 divide-x divide-[#C9A961]/20 text-center">
            {[
              { n: seller.rating.toFixed(1), l: "Baho" },
              { n: seller.reviewsCount, l: "Sharh" },
              { n: seller.productsCount, l: "Mahsulot" },
              { n: seller.ordersCount, l: "Buyurtma" },
            ].map((s) => (
              <div key={s.l} className="py-3 px-1">
                <div className="text-lg font-bold text-[#8B2635]" style={{ fontFamily: "Cormorant Garamond, serif" }}>{s.n}</div>
                <div className="text-[10px] text-[#8B7355]">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
              <p className="text-sm text-[#2B1810] leading-relaxed italic">"{seller.bio}"</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-[#8B7355] flex-wrap">
                <span>📅 {seller.since} yildan</span>
                {seller.halal && <span className="flex items-center gap-1 text-[#2D5F4E] font-semibold"><Shield className="w-3 h-3" /> Halol</span>}
                {seller.telegram && (
                  <a href={`https://t.me/${seller.telegram.replace("@", "")}`}
                    className="flex items-center gap-1 text-[#229ED9] font-semibold">
                    <Send className="w-3 h-3" /> {seller.telegram}
                  </a>
                )}
              </div>
            </div>

            {sellerProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-3 flex items-center gap-2 text-sm">
                  <Store className="w-4 h-4 text-[#8B2635]" /> Mahsulotlar ({sellerProducts.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {sellerProducts.map((p) => (
                    <button key={p.id} onClick={() => onSelectProduct(p)}
                      className="bg-white rounded-2xl overflow-hidden border border-[#C9A961]/20 active:scale-95 transition text-left">
                      <div className="aspect-square overflow-hidden bg-[#FBF5EC]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-2">
                        <div className="text-xs font-semibold text-[#2B1810] line-clamp-1">{p.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-0.5 text-xs">
                            <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
                            <span className="font-semibold">{p.rating}</span>
                          </div>
                          <div className="text-xs font-bold text-[#8B2635]">{formatPrice(p.price)}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sellerReviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-3 flex items-center gap-2 text-sm">
                  <Star className="w-4 h-4 text-[#C9A961]" /> So'nggi sharhlar
                </h3>
                <div className="space-y-2">
                  {sellerReviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-3 border border-[#C9A961]/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{r.avatar}</span>
                        <span className="font-semibold text-xs text-[#2B1810]">{r.author}</span>
                        <div className="flex ml-auto">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${i < r.rating ? "fill-[#C9A961] text-[#C9A961]" : "text-[#C9A961]/30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#8B7355] leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}
