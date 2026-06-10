import { type ReactNode } from "react";
import { adminStats } from "../data";

type Props = {
  active: string;
  onNavigate: (page: string) => void;
};

const navItems = [
  { id: "dashboard", label: "Бошқарув", icon: "📊" },
  { id: "orders", label: "Буюртмалар", icon: "📦", badge: adminStats.todayOrders },
  { id: "sellers", label: "Сотувчилар", icon: "👩‍🍳", badge: adminStats.pendingSellers },
  { id: "products", label: "Маҳсулотлар", icon: "🥮" },
  { id: "reviews", label: "Шарҳлар", icon: "⭐", badge: adminStats.pendingReviews },
  { id: "community", label: "Ҳамжамият", icon: "💬", badge: adminStats.reportedPosts },
  { id: "analytics", label: "Аналитика", icon: "📈" },
  { id: "settings", label: "Созламалар", icon: "⚙️" },
];

export default function Sidebar({ active, onNavigate }: Props) {
  return (
    <aside className="hidden lg:flex w-64 begim-pattern-dark text-[#FBF5EC] flex-col sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-[#C9A961]/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-[#C9A961] flex items-center justify-center shadow-md">
            <span className="text-[#8B2635] font-[Amiri] font-bold text-xl">ب</span>
          </div>
          <div>
            <div className="font-[Cormorant_Garamond] text-2xl font-semibold leading-none">Begim</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#E4CE8A] mt-0.5">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition text-sm ${
                isActive
                  ? "bg-[#C9A961] text-[#2B1810] font-semibold shadow-md"
                  : "text-[#F3E8D4]/80 hover:bg-[#FBF5EC]/5 hover:text-[#FBF5EC]"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? "bg-[#8B2635] text-[#FBF5EC]" : "bg-[#8B2635] text-[#E4CE8A]"
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[#C9A961]/20">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#FBF5EC]/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A961] to-[#E4CE8A] flex items-center justify-center text-[#2B1810] font-bold">
            А
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate">Админ</div>
            <div className="text-[11px] text-[#E4CE8A]">Super Admin</div>
          </div>
          <button className="text-[#E4CE8A] hover:text-[#FBF5EC] text-sm">⎋</button>
        </div>
      </div>
    </aside>
  );
}

type MobileSidebarProps = Props & {
  open: boolean;
  onClose: () => void;
};

export function MobileSidebar({ active, onNavigate, open, onClose }: MobileSidebarProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-72 h-full begim-pattern-dark text-[#FBF5EC] flex flex-col animate-fade-up">
        <div className="p-6 border-b border-[#C9A961]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C9A961] flex items-center justify-center">
              <span className="text-[#8B2635] font-[Amiri] font-bold text-lg">ب</span>
            </div>
            <span className="font-[Cormorant_Garamond] text-xl font-semibold">Begim Admin</span>
          </div>
          <button onClick={onClose} className="text-[#FBF5EC] text-2xl">×</button>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm ${
                  isActive
                    ? "bg-[#C9A961] text-[#2B1810] font-semibold"
                    : "text-[#F3E8D4]/80 hover:bg-[#FBF5EC]/5"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B2635] text-[#E4CE8A]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}

export function TopBar({ title, action, onMenuClick }: { title: string; action?: ReactNode; onMenuClick?: () => void }) {
  return (
    <div className="sticky top-0 z-30 bg-[#FBF5EC]/95 backdrop-blur-md border-b border-[#C9A961]/20">
      <div className="px-4 md:px-8 py-4 flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden w-10 h-10 rounded-xl bg-white border border-[#C9A961]/20 flex items-center justify-center"
          >
            ☰
          </button>
        )}
        <h1 className="font-[Cormorant_Garamond] text-2xl md:text-3xl font-semibold text-[#8B2635] flex-1">
          {title}
        </h1>
        {action}
        <a
          href="/"
          className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-[#8B2635] bg-white border border-[#8B2635]/20 px-3 py-2 rounded-full hover:bg-[#8B2635] hover:text-[#FBF5EC] transition"
        >
          🌐 Сайтга ўтиш
        </a>
      </div>
    </div>
  );
}
