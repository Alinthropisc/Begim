import { useState } from "react";
import { Sidebar, TopBar, type Page } from "./admin/components/Layout";
import Login from "./admin/pages/Login";
import Dashboard from "./admin/pages/Dashboard";
import Orders from "./admin/pages/Orders";
import Sellers from "./admin/pages/Sellers";
import Products from "./admin/pages/Products";
import Reviews from "./admin/pages/Reviews";
import Community from "./admin/pages/Community";
import Analytics from "./admin/pages/Analytics";
import Channel from "./admin/pages/Channel";
import Payments from "./admin/pages/Payments";
import Notifications from "./admin/pages/Notifications";
import Promos from "./admin/pages/Promos";
import Users from "./admin/pages/Users";
import Settings from "./admin/pages/Settings";

const TITLES: Record<Page, { uz: string; ru: string }> = {
  dashboard:     { uz:"Boshqaruv paneli",    ru:"Панель управления" },
  orders:        { uz:"Buyurtmalar",          ru:"Заказы" },
  sellers:       { uz:"Sotuvchilar",          ru:"Продавцы" },
  users:         { uz:"Xaridorlar",           ru:"Покупатели" },
  products:      { uz:"Mahsulotlar",          ru:"Товары" },
  reviews:       { uz:"Sharhlar",             ru:"Отзывы" },
  community:     { uz:"Jamoa moderatsiya",    ru:"Модерация сообщества" },
  channel:       { uz:"Kanal boshqaruvi",     ru:"Управление каналом" },
  notifications: { uz:"Bildirishnomalar",     ru:"Рассылка" },
  promos:        { uz:"Promo kodlar",         ru:"Промокоды" },
  payments:      { uz:"To'lovlar va chiqimlar",ru:"Выплаты и платежи" },
  analytics:     { uz:"Tahlil va hisobotlar", ru:"Аналитика и отчёты" },
  settings:      { uz:"Sozlamalar",           ru:"Настройки" },
};

export default function App() {
  const [authed, setAuthed] = useState(() => localStorage.getItem("bgm_admin_auth") === "1");
  const [page, setPage] = useState<Page>("dashboard");
  const [lang, setLang] = useState<"uz"|"ru">("uz");
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => { localStorage.removeItem("bgm_admin_auth"); setAuthed(false); };

  if (!authed) return <Login onLogin={() => setAuthed(true)} />;

  const title = TITLES[page][lang];
  const navProps = { page, onNavigate: setPage, onLogout: logout, lang, onToggleLang: () => setLang(l => l==="uz"?"ru":"uz") };

  const renderPage = () => {
    switch (page) {
      case "dashboard":     return <Dashboard />;
      case "orders":        return <Orders />;
      case "sellers":       return <Sellers />;
      case "users":         return <Users lang={lang} />;
      case "products":      return <Products />;
      case "reviews":       return <Reviews />;
      case "community":     return <Community />;
      case "channel":       return <Channel lang={lang} />;
      case "notifications": return <Notifications lang={lang} />;
      case "promos":        return <Promos lang={lang} />;
      case "payments":      return <Payments lang={lang} />;
      case "analytics":     return <Analytics />;
      case "settings":      return <Settings />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5EFE4]">
      <Sidebar {...navProps} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar {...navProps} title={title} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
