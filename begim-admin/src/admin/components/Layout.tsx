import {
  LayoutDashboard, ShoppingBag, Users, Package,
  Star, MessageSquare, BarChart2, Settings, LogOut,
  Menu, X, Bell, Globe, ChevronDown, CreditCard, Tag, UserCheck
} from "lucide-react";

export type Page =
  | "dashboard" | "orders" | "sellers" | "products"
  | "reviews" | "community" | "analytics" | "channel"
  | "payments" | "notifications" | "promos" | "users" | "settings";

const NAV: { id: Page; icon: React.ReactNode; uz: string; ru: string; badge?: number; section?: string }[] = [
  { id:"dashboard",      icon:<LayoutDashboard className="w-5 h-5"/>, uz:"Boshqaruv",    ru:"Дашборд",     section:"main" },
  { id:"orders",         icon:<ShoppingBag     className="w-5 h-5"/>, uz:"Buyurtmalar",  ru:"Заказы",       badge:3, section:"main" },
  { id:"sellers",        icon:<Users           className="w-5 h-5"/>, uz:"Sotuvchilar",  ru:"Продавцы",     badge:2, section:"main" },
  { id:"users",          icon:<UserCheck       className="w-5 h-5"/>, uz:"Xaridorlar",   ru:"Покупатели",   section:"main" },
  { id:"products",       icon:<Package         className="w-5 h-5"/>, uz:"Mahsulotlar",  ru:"Товары",       section:"catalog" },
  { id:"reviews",        icon:<Star            className="w-5 h-5"/>, uz:"Sharhlar",     ru:"Отзывы",       badge:5, section:"catalog" },
  { id:"community",      icon:<MessageSquare   className="w-5 h-5"/>, uz:"Jamoa",        ru:"Сообщество",   section:"catalog" },
  { id:"channel",        icon:<Bell            className="w-5 h-5"/>, uz:"Kanal",        ru:"Канал",        section:"marketing" },
  { id:"notifications",  icon:<Bell            className="w-5 h-5"/>, uz:"Bildirishnoma",ru:"Рассылка",     section:"marketing" },
  { id:"promos",         icon:<Tag             className="w-5 h-5"/>, uz:"Promo kodlar", ru:"Промокоды",    section:"marketing" },
  { id:"payments",       icon:<CreditCard      className="w-5 h-5"/>, uz:"To'lovlar",    ru:"Выплаты",      badge:2, section:"finance" },
  { id:"analytics",      icon:<BarChart2       className="w-5 h-5"/>, uz:"Tahlil",       ru:"Аналитика",    section:"finance" },
  { id:"settings",       icon:<Settings        className="w-5 h-5"/>, uz:"Sozlamalar",   ru:"Настройки",    section:"system" },
];

const SECTIONS: { id: string; uz: string; ru: string }[] = [
  { id:"main",      uz:"Asosiy",    ru:"Главное" },
  { id:"catalog",   uz:"Katalog",   ru:"Каталог" },
  { id:"marketing", uz:"Marketing", ru:"Маркетинг" },
  { id:"finance",   uz:"Moliya",    ru:"Финансы" },
  { id:"system",    uz:"Tizim",     ru:"Система" },
];

type Props = { page: Page; onNavigate: (p: Page) => void; onLogout: () => void; lang: "uz"|"ru"; onToggleLang: () => void };

function NavItems({ page, onNavigate, lang, onClose }: Props & { onClose?: () => void }) {
  const uz = lang === "uz";
  return (
    <>
      {SECTIONS.map(sec => {
        const items = NAV.filter(n => n.section === sec.id);
        return (
          <div key={sec.id}>
            <div className="px-3 pt-4 pb-1 text-[9px] uppercase tracking-widest text-[#C9A961]/40 font-semibold">
              {uz ? sec.uz : sec.ru}
            </div>
            {items.map(item => {
              const active = page === item.id;
              return (
                <button key={item.id} type="button"
                  onClick={() => { onNavigate(item.id); onClose?.(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition relative ${active ? "bg-[#8B2635] text-white shadow-lg shadow-[#8B2635]/30" : "text-[#C9A961]/70 hover:text-[#F3E8D4] hover:bg-white/5"}`}>
                  {item.icon}
                  <span className="flex-1 text-left">{uz ? item.uz : item.ru}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-[#C9A961] text-[#2B1810] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

export function Sidebar(props: Props) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#2B1810] text-[#F3E8D4] h-screen sticky top-0 flex-shrink-0">
      <div className="px-6 py-5 border-b border-[#C9A961]/20 flex-shrink-0">
        <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#C9A961]">Begim</div>
        <div className="text-[10px] text-[#C9A961]/60 uppercase tracking-widest">Admin Panel</div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-3 no-scrollbar">
        <NavItems {...props} />
      </nav>
      <div className="px-3 py-4 border-t border-[#C9A961]/20 space-y-1 flex-shrink-0">
        <button type="button" onClick={props.onToggleLang}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#C9A961]/70 hover:text-[#F3E8D4] hover:bg-white/5 transition">
          <Globe className="w-5 h-5" /><span>{props.lang==="uz"?"O'zbek":"Русский"}</span><ChevronDown className="w-3 h-3 ml-auto"/>
        </button>
        <button type="button" onClick={props.onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition">
          <LogOut className="w-5 h-5" /><span>{props.lang==="uz"?"Chiqish":"Выйти"}</span>
        </button>
      </div>
    </aside>
  );
}

export function TopBar(props: Props & { title: string; mobileOpen: boolean; setMobileOpen: (v:boolean)=>void }) {
  const { title, mobileOpen, setMobileOpen, lang, onToggleLang } = props;
  const totalBadges = NAV.reduce((s, n) => s + (n.badge || 0), 0);
  return (
    <>
      <header className="sticky top-0 z-20 bg-[#FBF5EC]/95 backdrop-blur border-b border-[#C9A961]/20 flex items-center gap-4 px-4 md:px-6 h-14">
        <button type="button" className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#C9A961]/10" onClick={()=>setMobileOpen(true)}>
          <Menu className="w-5 h-5 text-[#2B1810]"/>
        </button>
        <h1 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#8B2635] flex-1">{title}</h1>
        <div className="relative">
          <button type="button" className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#C9A961]/10">
            <Bell className="w-5 h-5 text-[#8B7355]"/>
          </button>
          {totalBadges > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#8B2635] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{totalBadges}</span>
          )}
        </div>
        <button type="button" onClick={onToggleLang}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#8B7355] border border-[#C9A961]/30 px-3 py-1.5 rounded-full hover:border-[#C9A961] transition">
          <Globe className="w-3.5 h-3.5"/> {lang==="uz"?"UZ":"RU"}
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B2635] to-[#C9A961] flex items-center justify-center text-sm font-bold text-white">A</div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={()=>setMobileOpen(false)}/>
          <div className="relative w-64 bg-[#2B1810] text-[#F3E8D4] h-full flex flex-col">
            <div className="px-6 py-5 border-b border-[#C9A961]/20 flex items-center justify-between flex-shrink-0">
              <div>
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#C9A961]">Begim</div>
                <div className="text-[10px] text-[#C9A961]/60 uppercase tracking-widest">Admin Panel</div>
              </div>
              <button type="button" onClick={()=>setMobileOpen(false)}><X className="w-5 h-5 text-[#C9A961]/60"/></button>
            </div>
            <nav className="flex-1 py-2 px-3 overflow-y-auto no-scrollbar">
              <NavItems {...props} onClose={()=>setMobileOpen(false)}/>
            </nav>
            <div className="px-3 py-4 border-t border-[#C9A961]/20 flex-shrink-0">
              <button type="button" onClick={()=>{props.onLogout();setMobileOpen(false);}}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition">
                <LogOut className="w-5 h-5"/>{props.lang==="uz"?"Chiqish":"Выйти"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
