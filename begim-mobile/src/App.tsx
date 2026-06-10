import { useState, useEffect } from "react";
import PhoneMockup from "./components/PhoneMockup";
import SplashScreen from "./screens/SplashScreen";
import HomeScreen from "./screens/HomeScreen";
import CatalogScreen from "./screens/CatalogScreen";
import ProductScreen from "./screens/ProductScreen";
import CommunityScreen from "./screens/CommunityScreen";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import CartScreen from "./screens/CartScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { products } from "./data/mockData";

type Screen =
  | "splash"
  | "home"
  | "catalog"
  | "product"
  | "community"
  | "recipe"
  | "cart"
  | "profile";

export interface CartItem {
  id: string;
  quantity: number;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
  const [showSplash, setShowSplash] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-hide splash after 2.5s
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        setCurrentScreen("home");
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === productId);
      if (existing) {
        return prev.map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { id: productId, quantity: 1 }];
    });
    const product = products.find((p) => p.id === productId);
    setToast(`✓ ${product?.name || "Mahsulot"} savatga qo'shildi`);
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.id === productId ? { ...i, quantity: i.quantity + delta } : i,
        )
        .filter((i) => i.quantity > 0),
    );
  };

  const clearCart = () => {
    setCart([]);
    setToast("🗑️ Savatcha tozalandi");
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  const goTo = (screen: Screen) => {
    setShowSplash(false);
    setCurrentScreen(screen);
  };

  const screens: { id: Screen; label: string; icon: string }[] = [
    { id: "home", label: "Bosh", icon: "🏠" },
    { id: "catalog", label: "Katalog", icon: "🛍️" },
    { id: "community", label: "Jamoa", icon: "💬" },
    { id: "cart", label: "Savat", icon: "🛒" },
    { id: "profile", label: "Profil", icon: "👤" },
  ];

  const renderScreen = () => {
    if (showSplash) return <SplashScreen />;

    switch (currentScreen) {
      case "home":
        return (
          <HomeScreen
            onNavigate={goTo}
            onProductClick={() => goTo("product")}
            onAddToCart={addToCart}
          />
        );
      case "catalog":
        return (
          <CatalogScreen
            onProductClick={() => goTo("product")}
            onAddToCart={addToCart}
          />
        );
      case "product":
        return (
          <ProductScreen
            onBack={() => goTo("home")}
            onAddToCart={addToCart}
          />
        );
      case "community":
        return (
          <CommunityScreen
            onRecipeClick={() => goTo("recipe")}
          />
        );
      case "recipe":
        return (
          <RecipeDetailScreen
            onBack={() => goTo("community")}
            onAddToCart={addToCart}
          />
        );
      case "cart":
        return (
          <CartScreen
            cart={cart}
            onUpdateQty={updateCartQty}
            onClear={clearCart}
            onContinueShopping={() => goTo("catalog")}
            onCheckout={() => {
              clearCart();
              goTo("home");
            }}
          />
        );
      case "profile":
        return <ProfileScreen />;
      default:
        return <HomeScreen onNavigate={goTo} onAddToCart={addToCart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 pattern-bg">
      {/* Header */}
      <header className="relative z-10 border-b border-gold/20 backdrop-blur-sm bg-black/30">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-bordeaux border-2 border-gold flex items-center justify-center text-2xl shadow-lg shadow-bordeaux/50">
              🥮
            </div>
            <div>
              <h1
                className="text-3xl font-bold gradient-gold"
                style={{ fontFamily: "var(--font-arabic)" }}
              >
                Begim
              </h1>
              <p
                className="text-xs text-ink-light italic"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Uy shirinliklari bozori
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <span className="px-3 py-1.5 text-xs font-semibold bg-emerald/20 text-emerald rounded-full border border-emerald/30">
              ● Flutter MVP
            </span>
            <span className="px-3 py-1.5 text-xs font-semibold bg-bordeaux/20 text-bordeaux-light rounded-full border border-bordeaux/30">
              Android · iOS
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-12 items-center">
          {/* Left info */}
          <div className="hidden lg:block space-y-8 text-cream">
            <div>
              <p className="text-gold text-sm font-medium mb-3 tracking-widest uppercase">
                ✦ Mobile Application ✦
              </p>
              <h2
                className="text-5xl leading-tight mb-4"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Shirinliklar — <br />
                <span className="gradient-gold">uydan, mehr bilan</span>
              </h2>
              <p className="text-ink-light text-base leading-relaxed max-w-md">
                Telegram Mini App + native Android/iOS ilovasi. O'zbek ayollari
                uchun platforma — o'z shirinliklaringizni soting va oilaviy
                retseptlaringizni ulashing.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { icon: "🎨", title: "Material 3", desc: "Zamonaviy UI" },
                { icon: "⚡", title: "Flutter + Dart", desc: "60 FPS" },
                { icon: "🌙", title: "Uzbek-Islamic", desc: "Dizayn" },
                { icon: "🏗️", title: "Clean Architecture", desc: "SOLID + DRY" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 p-3 rounded-xl bg-cream/5 border border-gold/10 hover:border-gold/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-cream/10 flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-cream">{item.title}</p>
                    <p className="text-xs text-ink-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Killer features */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-bordeaux/30 to-bordeaux/10 border border-bordeaux/30">
              <h3
                className="text-lg mb-3 text-cream flex items-center gap-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <span className="text-gold">🚀</span> Killer Features
              </h3>
              <ul className="space-y-2 text-sm text-cream/80">
                <li className="flex gap-2">
                  <span className="text-gold">🏆</span>
                  <span>Haftaning chellenjlari (100 000 so'm yutuq)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">🎓</span>
                  <span>Master-klasslar top-sotuvchilardan</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">⭐</span>
                  <span>Karma sistema + darajalar</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">💬</span>
                  <span>Emoji reaksiyalar (Telegram uslubida)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-gold">🚀</span>
                  <span>Boost — postlarni targ'ib qilish</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative">
            <PhoneMockup currentScreen={currentScreen} onNavigate={goTo}>
              {renderScreen()}
            </PhoneMockup>

            {/* Toast notification */}
            {toast && (
              <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-50 bg-emerald text-white px-4 py-2.5 rounded-full shadow-xl text-sm font-medium animate-fade-in whitespace-nowrap">
                {toast}
              </div>
            )}
          </div>

          {/* Right info */}
          <div className="hidden lg:block space-y-6">
            {/* Colors */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-bordeaux/20 to-bordeaux/5 border border-bordeaux/30">
              <h3
                className="text-2xl mb-4 text-cream"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ranglar palitrasi
              </h3>
              <div className="space-y-2">
                {[
                  { name: "Bordeaux", hex: "#8B2635", color: "bg-bordeaux" },
                  { name: "Gold", hex: "#C9A961", color: "bg-gold" },
                  { name: "Cream", hex: "#FBF5EC", color: "bg-cream" },
                  { name: "Emerald", hex: "#2D5F4E", color: "bg-emerald" },
                  { name: "Ink", hex: "#2B1810", color: "bg-ink" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg ${c.color} border border-white/10`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-cream">{c.name}</p>
                      <p className="text-xs text-ink-light font-mono">{c.hex}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 rounded-2xl bg-cream/5 border border-gold/20">
              <h3
                className="text-xl mb-3 text-cream"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Ekranlar
              </h3>
              <div className="space-y-1">
                {[
                  ...screens,
                  { id: "recipe" as Screen, label: "Retsept Detali", icon: "📖" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => goTo(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      currentScreen === s.id && !showSplash
                        ? "bg-bordeaux text-cream"
                        : "text-cream/70 hover:bg-cream/10"
                    }`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-sm font-medium">{s.label}</span>
                    {s.id === "cart" && cartCount > 0 && (
                      <span className="ml-auto bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile screen switcher */}
        <div className="lg:hidden mt-8 flex gap-2 overflow-x-auto phone-scroll pb-2">
          {[
            ...screens,
            { id: "recipe" as Screen, label: "Retsept", icon: "📖" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => goTo(s.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                currentScreen === s.id && !showSplash
                  ? "bg-bordeaux border-bordeaux text-cream"
                  : "bg-cream/5 border-gold/20 text-cream/70"
              }`}
            >
              <span>{s.icon}</span>
              <span className="text-sm font-medium">{s.label}</span>
              {s.id === "cart" && cartCount > 0 && (
                <span className="bg-gold text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gold/20 text-center text-ink-light text-sm">
          <p className="divider-ornament mb-4">
            <span style={{ fontFamily: "var(--font-arabic)" }}>
              Bismillahir Rohmanir Rohiym
            </span>
          </p>
          <p>
            Made with <span className="text-bordeaux-light">❤</span> in
            Uzbekistan 🇺🇿 · © 2026 Begim
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
