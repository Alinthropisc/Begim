import { useState } from "react";
import Sidebar, { MobileSidebar, TopBar } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Sellers from "./pages/Sellers";
import Products from "./pages/Products";
import Reviews from "./pages/Reviews";
import Community from "./pages/Community";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

const pageTitles: Record<string, string> = {
  dashboard: "Бошқарув панели",
  orders: "Буюртмалар",
  sellers: "Сотувчилар",
  products: "Маҳсулотлар",
  reviews: "Шарҳлар ва баҳолар",
  community: "Ҳамжамият модерацияси",
  analytics: "Аналитика ва ҳисоботлар",
  settings: "Созламалар",
};

export default function AdminApp({ onExit }: { onExit?: () => void }) {
  const [page, setPage] = useState<string>("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "orders": return <Orders />;
      case "sellers": return <Sellers />;
      case "products": return <Products />;
      case "reviews": return <Reviews />;
      case "community": return <Community />;
      case "analytics": return <Analytics />;
      case "settings": return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF5EC] flex">
      <Sidebar active={page} onNavigate={setPage} />
      <MobileSidebar active={page} onNavigate={setPage} open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          title={pageTitles[page] || "Begim Admin"}
          onMenuClick={() => setMobileOpen(true)}
          action={
            <button
              onClick={onExit}
              className="hidden md:inline-flex items-center gap-2 text-xs font-semibold text-[#FBF5EC] bg-[#8B2635] hover:bg-[#6B1A27] px-4 py-2 rounded-full transition shadow-sm"
            >
              ← Сайтга қайтиш
            </button>
          }
        />
        <main className="flex-1 p-4 md:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
