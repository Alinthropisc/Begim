import { useState, useEffect, useMemo } from "react";
import {
  Search, Heart, ShoppingBag, Star, Plus, Minus, X,
  MapPin, Phone, ChevronRight, Sparkles, Shield,
  Store, Send, User, Home, Grid3x3, CheckCircle2, Flame, Users
} from "lucide-react";
import {
  products, categories, reviews, stories, formatPrice,
  type Product
} from "./data/products";
import { sellers, getSellerById } from "./data/sellers";
import StoriesBar from "./components/StoriesBar";
import StoryViewer from "./components/StoryViewer";
import CommunityView from "./components/CommunityView";
import TelegramBanner from "./components/TelegramBanner";
import { useTelegram } from "./hooks/useTelegram";
import { BOT_CONFIG } from "./config";

type CartItem = { id: string; qty: number };
type View = "home" | "categories" | "community" | "fav" | "profile";

declare global {
  interface Window {
    Telegram?: { WebApp?: any };
  }
}

export default function BegimApp() {
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
    setToast("Savatga qo'shildi ✓");
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

  const checkout = () => {
    if (!isTelegram) {
      setShowCart(false);
      setTelegramBanner("buy");
      return;
    }

    // Send order data to bot via Telegram.WebApp.sendData
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

    try {
      tg.sendData(JSON.stringify(orderData));
      tg.haptic("medium");
    } catch (e) {
      console.warn("sendData failed:", e);
    }

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
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#8B7355] -mt-1 flex items-center gap-1">
                  <span>uy bozori</span>
                  {isTelegram && (
                    <span className="bg-[#229ED9] text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold">MINI APP</span>
                  )}
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

          {/* Search bar (desktop inline, mobile full) */}
          <div className={`${view === "home" ? "md:hidden" : ""} pb-3`}>
            <SearchBar query={query} setQuery={setQuery} />
          </div>
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
            query={query}
            setQuery={setQuery}
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
          />
        )}

        {view === "community" && (
          <CommunityView onOpenApp={() => requireTelegram("community")} />
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
          <ProfileView onOpenSeller={() => setShowSeller(true)} tgUser={tgUser} />
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
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FBF5EC]/95 backdrop-blur-md border-t border-[#C9A961]/20 pb-safe">
        <div className="grid grid-cols-5 max-w-md mx-auto">
          {([
            { id: "home", icon: Home, label: "Bosh" },
            { id: "categories", icon: Grid3x3, label: "Katalog" },
            { id: "community", icon: Users, label: "Jamoa" },
            { id: "fav", icon: Heart, label: "Sevimli" },
            { id: "profile", icon: User, label: "Profil" },
          ] as const).map((t) => {
            const Icon = t.icon;
            const active = view === t.id;
            const handleClick = () => {
              if (t.id === "profile" && !isTelegram) { requireTelegram("register"); return; }
              setView(t.id);
            };
            return (
              <button
                key={t.id}
                onClick={handleClick}
                className={`relative flex flex-col items-center py-2.5 gap-1 transition ${active ? "text-[#8B2635]" : "text-[#8B7355]"}`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${active ? "fill-[#8B2635]/10" : ""}`} />
                  {t.id === "fav" && fav.length > 0 && (
                    <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-[#8B2635] text-[#FBF5EC] text-[8px] font-bold rounded-full flex items-center justify-center">
                      {fav.length}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{t.label}</span>
                {active && <div className="absolute bottom-0 w-8 h-0.5 bg-[#8B2635] rounded-t" />}
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

function SearchBar({ query, setQuery }: { query: string; setQuery: (s: string) => void }) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Shirinlik, non, somsa qidiring..."
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
  query: string;
  setQuery: (s: string) => void;
}) {
  const { products: list, activeCategory, setActiveCategory, onSelect, onFav, favSet, onAdd, onOpenSeller, onOpenStory, onOpenCommunity, query, setQuery } = props;

  return (
    <div className="animate-fade-up space-y-8">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B2635] via-[#6B1A27] to-[#8B2635] text-[#FBF5EC] p-6 md:p-10 begim-pattern-dark">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A961]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E4CE8A]/10 rounded-full blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-6 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#FBF5EC]/10 backdrop-blur rounded-full px-3 py-1 mb-4 text-xs">
              <Sparkles className="w-3 h-3 text-[#E4CE8A]" />
              <span className="text-[#E4CE8A]">Halol · Sifatli · Uyda tayyorlangan</span>
            </div>
            <h1 className="font-[Cormorant_Garamond] text-4xl md:text-6xl font-semibold leading-[1.05] mb-3">
              Uy shirinliklari,<br />
              <span className="text-shimmer-gold">mehribon qo'llardan</span>
            </h1>
            <p className="text-[#F3E8D4]/80 mb-6 max-w-md">
              Begim — O'zbekiston bo'ylab ayollar tomonidan tayyorlangan non, shirinlik va somsalarning eng yaxshi bozori.
            </p>
            <div className="flex flex-wrap gap-3">
              <button onClick={onOpenSeller} className="btn-gold px-5 py-3 rounded-full text-sm font-semibold flex items-center gap-2">
                <Store className="w-4 h-4" /> Sotuvchi bo'lish
              </button>
              <button onClick={onOpenCommunity} className="px-5 py-3 rounded-full text-sm font-semibold border border-[#E4CE8A]/40 hover:bg-[#FBF5EC]/10 transition flex items-center gap-2">
                <Users className="w-4 h-4" /> Hamjamiyat
              </button>
              <button
                onClick={() => window.open(BOT_CONFIG.shareLink, "_blank")}
                className="px-5 py-3 rounded-full text-sm font-semibold bg-[#229ED9] hover:bg-[#1a7fb0] text-white transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Ulashish
              </button>
            </div>

            <div className="mt-8 flex gap-6 text-sm">
              <div>
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#E4CE8A]">1,200+</div>
                <div className="text-[#F3E8D4]/70 text-xs">Uy bekalari</div>
              </div>
              <div>
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#E4CE8A]">14</div>
                <div className="text-[#F3E8D4]/70 text-xs">Shaharlar</div>
              </div>
              <div>
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#E4CE8A]">4.9</div>
                <div className="text-[#F3E8D4]/70 text-xs">O'rtacha baho</div>
              </div>
            </div>
          </div>

          <div className="hidden md:flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#C9A961]/30 rounded-full blur-2xl scale-110" />
              <div className="relative w-72 h-72 rounded-full bg-gradient-to-br from-[#C9A961]/20 to-[#E4CE8A]/10 border-2 border-[#E4CE8A]/30 flex items-center justify-center">
                <div className="text-[180px] leading-none">🥮</div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#FBF5EC] text-[#8B2635] rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2">
                <Flame className="w-4 h-4" />
                <div>
                  <div className="text-xs font-semibold">Eng ommabop</div>
                  <div className="text-[10px] text-[#8B7355]">Samarqand noni</div>
                </div>
              </div>
              <div className="absolute -bottom-2 -left-6 bg-[#FBF5EC] text-[#2D5F4E] rounded-2xl px-4 py-2 shadow-xl flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <div>
                  <div className="text-xs font-semibold">100% Halol</div>
                  <div className="text-[10px] text-[#8B7355]">Tekshirilgan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 h-6 begim-ornament opacity-60" />
      </section>

      {/* STORIES */}
      <StoriesBar stories={stories} onOpen={onOpenStory} onOpenApp={props.onOpenApp} />

      {/* DESKTOP SEARCH */}
      <div className="hidden md:block">
        <SearchBar query={query} setQuery={setQuery} />
      </div>

      {/* CATEGORIES */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">Kategoriyalar</h2>
          <button className="text-sm text-[#8B7355] hover:text-[#8B2635] flex items-center gap-1">
            Hammasi <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
          {categories.map((c) => {
            const active = activeCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border-2 transition ${
                  active
                    ? "bg-[#8B2635] border-[#8B2635] text-[#FBF5EC] shadow-lg shadow-[#8B2635]/20"
                    : "bg-white border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
                }`}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="font-medium text-sm whitespace-nowrap">{c.nameUz}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS GRID */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">
            {activeCategory === "all" ? "Barcha mahsulotlar" : categories.find((c) => c.id === activeCategory)?.nameUz}
          </h2>
          <span className="text-sm text-[#8B7355]">{list.length} ta</span>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-[#C9A961]/40">
            <div className="text-6xl mb-3">🔎</div>
            <p className="text-[#8B7355]">Hech narsa topilmadi</p>
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
  const { products: list, activeCategory, setActiveCategory, onSelect, onFav, favSet, onAdd } = props;
  return (
    <div className="animate-fade-up space-y-6">
      <h1 className="font-[Cormorant_Garamond] text-4xl font-semibold text-[#8B2635]">Katalog</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {categories.slice(1).map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCategory(c.id)}
            className={`p-5 rounded-2xl border-2 text-left transition ${
              activeCategory === c.id
                ? "bg-[#8B2635] border-[#8B2635] text-[#FBF5EC]"
                : "bg-white border-[#C9A961]/30 hover:border-[#C9A961]"
            }`}
          >
            <div className="text-4xl mb-2">{c.emoji}</div>
            <div className="font-[Cormorant_Garamond] text-xl font-semibold">{c.nameUz}</div>
            <div className={`text-xs mt-1 ${activeCategory === c.id ? "text-[#E4CE8A]" : "text-[#8B7355]"}`}>
              {products.filter((p: Product) => p.category === c.id).length} ta mahsulot
            </div>
          </button>
        ))}
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

function ProfileView({ onOpenSeller, tgUser }: { onOpenSeller: () => void; tgUser: any }) {
  const orders = [
    { id: "#BGM-1024", date: "12 mart 2026", items: "Samarqand noni × 2", total: 36000, status: "Yetkazildi" },
    { id: "#BGM-998", date: "8 mart 2026", items: "Napoleon torti × 1", total: 185000, status: "Yetkazildi" },
  ];
  const displayName = tgUser ? `${tgUser.first_name}${tgUser.last_name ? " " + tgUser.last_name : ""}` : "Mehmon";
  const displayUsername = tgUser?.username ? `@${tgUser.username}` : "+998 90 ••• •• ••";

  return (
    <div className="animate-fade-up space-y-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl p-6 border border-[#C9A961]/20 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8B2635] to-[#6B1A27] flex items-center justify-center text-3xl overflow-hidden">
            {tgUser?.photo_url ? (
              <img src={tgUser.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <h1 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">{displayName}</h1>
            <p className="text-sm text-[#8B7355]">{displayUsername}</p>
            {tgUser?.is_premium && (
              <span className="inline-block mt-1 text-[10px] bg-gradient-to-r from-[#C9A961] to-[#E4CE8A] text-[#2B1810] font-bold px-2 py-0.5 rounded-full">⭐ PREMIUM</span>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-2 border border-[#C9A961]/20 shadow-sm overflow-hidden">
        {[
          { icon: ShoppingBag, label: "Mening buyurtmalarim", count: orders.length },
          { icon: Store, label: "Sotuvchi bo'lish", onClick: onOpenSeller, hot: true },
          { icon: MapPin, label: "Yetkazib berish manzili" },
          { icon: Send, label: "Telegram bilan bog'lash" },
          { icon: Phone, label: "Qo'llab-quvvatlash" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <button
              key={i}
              onClick={m.onClick}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#FBF5EC] transition text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#8B2635]" />
              </div>
              <div className="flex-1 font-medium text-[#2B1810]">{m.label}</div>
              {m.hot && <span className="text-[10px] bg-[#8B2635] text-[#FBF5EC] px-2 py-0.5 rounded-full font-bold">YANGI</span>}
              {(m.count ?? 0) > 0 && <span className="text-xs text-[#8B7355]">{m.count}</span>}
              <ChevronRight className="w-4 h-4 text-[#8B7355]" />
            </button>
          );
        })}
      </div>

      <div>
        <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635] mb-3">Oxirgi buyurtmalar</h2>
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl p-4 border border-[#C9A961]/20 flex items-center justify-between">
              <div>
                <div className="font-semibold text-[#2B1810]">{o.id}</div>
                <div className="text-xs text-[#8B7355]">{o.items}</div>
                <div className="text-xs text-[#8B7355] mt-1">{o.date}</div>
              </div>
              <div className="text-right">
                <div className="font-[Cormorant_Garamond] text-xl font-semibold text-[#8B2635]">{formatPrice(o.total)}</div>
                <div className="text-xs text-[#2D5F4E] flex items-center gap-1 justify-end">
                  <CheckCircle2 className="w-3 h-3" /> {o.status}
                </div>
              </div>
            </div>
          ))}
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
        <div className="mt-auto pt-3 flex items-end justify-between gap-2">
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
              <button onClick={onCheckout} className="btn-begim w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2">
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
  ).slice(0, 6);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-[#2B1810]/60 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full md:max-w-2xl max-h-[94vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md">
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto begim-scroll">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#8B2635] to-[#6B1A27] begim-pattern-dark text-[#FBF5EC] p-8 pb-12">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-[#FBF5EC]/20 flex items-center justify-center text-5xl flex-shrink-0 ring-4 ring-[#C9A961]/40">
                {seller.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-2xl font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>{seller.name}</h2>
                  {seller.verified && <CheckCircle2 className="w-5 h-5 text-[#E4CE8A] flex-shrink-0" />}
                </div>
                {seller.badge && (
                  <span className="inline-block text-[10px] font-bold bg-[#C9A961] text-[#2B1810] px-2 py-0.5 rounded-full mb-2">{seller.badge}</span>
                )}
                <div className="flex items-center gap-1 text-sm text-[#F3E8D4]/80 mb-1">
                  <MapPin className="w-3.5 h-3.5" /> {seller.city}
                </div>
                <div className="text-sm text-[#F3E8D4]/70">{seller.speciality}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white -mt-6 mx-4 rounded-2xl shadow-md grid grid-cols-4 divide-x divide-[#C9A961]/20 text-center">
            {[
              { n: seller.rating.toFixed(1), l: "Baho" },
              { n: seller.reviewsCount, l: "Sharh" },
              { n: seller.productsCount, l: "Mahsulot" },
              { n: seller.ordersCount, l: "Buyurtma" },
            ].map((s) => (
              <div key={s.l} className="py-3 px-2">
                <div className="text-xl font-bold text-[#8B2635]" style={{ fontFamily: "Cormorant Garamond, serif" }}>{s.n}</div>
                <div className="text-[10px] text-[#8B7355]">{s.l}</div>
              </div>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* Bio */}
            <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
              <p className="text-sm text-[#2B1810] leading-relaxed italic">"{seller.bio}"</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-[#8B7355]">
                <span>📅 {seller.since} yildan beri</span>
                {seller.halal && <span className="flex items-center gap-1 text-[#2D5F4E] font-semibold"><Shield className="w-3 h-3" /> Halol</span>}
                {seller.telegram && (
                  <a href={`https://t.me/${seller.telegram.replace("@", "")}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-[#229ED9] font-semibold hover:underline">
                    <Send className="w-3 h-3" /> {seller.telegram}
                  </a>
                )}
              </div>
            </div>

            {/* Products */}
            {sellerProducts.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#8B2635]" /> Mahsulotlar ({sellerProducts.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {sellerProducts.map((p) => (
                    <button key={p.id} onClick={() => onSelectProduct(p)}
                      className="bg-white rounded-2xl overflow-hidden border border-[#C9A961]/20 hover:border-[#C9A961] hover:shadow-md transition text-left group">
                      <div className="aspect-square overflow-hidden bg-[#FBF5EC]">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div className="p-2.5">
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

            {/* Recent reviews */}
            {sellerReviews.length > 0 && (
              <div>
                <h3 className="font-semibold text-[#2B1810] mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#C9A961]" /> So'nggi sharhlar
                </h3>
                <div className="space-y-3">
                  {sellerReviews.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-full bg-[#8B2635]/10 flex items-center justify-center text-base">{r.avatar}</div>
                        <div className="font-semibold text-sm text-[#2B1810]">{r.author}</div>
                        <div className="flex ml-auto">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < r.rating ? "fill-[#C9A961] text-[#C9A961]" : "text-[#C9A961]/30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-[#8B7355] leading-relaxed">{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
