import { ReactNode } from "react";

type Screen = "splash" | "home" | "catalog" | "product" | "community" | "recipe" | "cart" | "profile";

interface PhoneMockupProps {
  children: ReactNode;
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function PhoneMockup({
  children,
  currentScreen,
  onNavigate,
}: PhoneMockupProps) {
  const showBottomNav = currentScreen !== "splash";

  const navItems: { id: Screen; icon: string; label: string }[] = [
    { id: "home", icon: "🏠", label: "Bosh" },
    { id: "catalog", icon: "🛍️", label: "Katalog" },
    { id: "community", icon: "💬", label: "Jamoa" },
    { id: "cart", icon: "🛒", label: "Savat" },
    { id: "profile", icon: "👤", label: "Profil" },
  ];

  return (
    <div className="relative mx-auto animate-scale-in">
      {/* Phone frame */}
      <div className="relative w-[380px] h-[780px] bg-stone-900 rounded-[3rem] p-3 shadow-2xl shadow-black/80 border-4 border-stone-800">
        {/* Side buttons */}
        <div className="absolute left-[-6px] top-32 w-1 h-16 bg-stone-700 rounded-l" />
        <div className="absolute left-[-6px] top-52 w-1 h-24 bg-stone-700 rounded-l" />
        <div className="absolute right-[-6px] top-40 w-1 h-20 bg-stone-700 rounded-r" />

        {/* Screen */}
        <div className="relative w-full h-full bg-cream rounded-[2.5rem] overflow-hidden">
          {/* Status bar */}
          {currentScreen !== "splash" && (
            <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-2 text-ink text-xs font-semibold">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <span>📶</span>
                <span>📡</span>
                <span>🔋</span>
              </div>
            </div>
          )}

          {/* Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-900 rounded-full z-40" />

          {/* Content */}
          <div className="absolute inset-0 overflow-hidden">
            <div key={currentScreen} className="w-full h-full animate-fade-in">
              {children}
            </div>
          </div>

          {/* Bottom navigation */}
          {showBottomNav && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-divider z-20">
              <div className="flex items-center justify-around py-2 pb-4">
                {navItems.map((item) => {
                  const isActive = currentScreen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 transition-all relative"
                    >
                      <span
                        className={`text-lg ${
                          isActive ? "scale-110" : "grayscale opacity-60"
                        } transition-all`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`text-[10px] font-medium transition-colors ${
                          isActive ? "text-bordeaux" : "text-ink-muted"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-0 w-8 h-0.5 bg-bordeaux rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-900 rounded-full" />
            </div>
          )}
        </div>
      </div>

      {/* Glow effect */}
      <div className="absolute inset-0 -z-10 blur-3xl opacity-30 bg-gradient-to-br from-bordeaux via-gold to-bordeaux rounded-[3rem]" />
    </div>
  );
}
