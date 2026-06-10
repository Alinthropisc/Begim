import { Card, StatCard, Badge } from "../components/UI";
import { weeklySales, topCities, topProducts, adminOrders, formatPrice, formatShortPrice, statusLabels } from "../data";
import { useAdminStats } from "../api";

export default function Dashboard() {
  // Живые агрегаты из API (с фолбэком на моки внутри хука).
  const adminStats = useAdminStats();
  const maxSale = Math.max(...weeklySales.map((s) => s.value));
  const recentOrders = adminOrders.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Буюртмалар (бугун)"
          value={adminStats.todayOrders}
          delta={adminStats.todayOrdersDelta}
          icon="📦"
          color="bordeaux"
        />
        <StatCard
          label="Даромад (бугун)"
          value={formatShortPrice(adminStats.todayRevenue) + " so'm"}
          delta={adminStats.todayRevenueDelta}
          icon="💰"
          color="gold"
        />
        <StatCard
          label="Фаол сотувчилар"
          value={adminStats.activeSellers}
          delta={adminStats.activeSellersDelta}
          icon="👩‍🍳"
          color="emerald"
        />
        <StatCard
          label="Фойдаланувчилар"
          value={adminStats.totalUsers.toLocaleString()}
          delta={adminStats.totalUsersDelta}
          icon="👥"
          color="dark"
        />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Кутилаётган шарҳлар", count: adminStats.pendingReviews, color: "bg-amber-50 border-amber-200 text-amber-800", icon: "⭐" },
          { label: "Янги сотувчилар", count: adminStats.pendingSellers, color: "bg-blue-50 border-blue-200 text-blue-800", icon: "👩‍🍳" },
          { label: "Шикоятлар", count: adminStats.reportedPosts, color: "bg-red-50 border-red-200 text-red-800", icon: "⚠️" },
        ].map((a, i) => (
          <div key={i} className={`rounded-2xl border p-4 flex items-center gap-3 ${a.color}`}>
            <div className="text-2xl">{a.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-medium">{a.label}</div>
              <div className="font-[Cormorant_Garamond] text-2xl font-bold">{a.count}</div>
            </div>
            <button className="text-xs font-semibold underline">Кўриш</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales chart */}
        <Card title="Ҳафталик сотувлар" className="lg:col-span-2">
          <div className="flex items-end gap-2 h-48">
            {weeklySales.map((s, i) => {
              const height = (s.value / maxSale) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-semibold text-[#8B7355] opacity-0 group-hover:opacity-100 transition">
                    {formatShortPrice(s.value)}
                  </div>
                  <div className="flex-1 w-full flex items-end">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-[#8B2635] to-[#C9A961] hover:from-[#6B1A27] hover:to-[#E4CE8A] transition-all relative group cursor-pointer"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-[#8B7355]">{s.day}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#C9A961]/10 flex items-center justify-between text-sm">
            <div className="text-[#8B7355]">Умумий ҳафталик:</div>
            <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#8B2635]">
              {formatPrice(weeklySales.reduce((s, x) => s + x.value, 0))}
            </div>
          </div>
        </Card>

        {/* Top cities */}
        <Card title="Топ шаҳарлар">
          <div className="space-y-3">
            {topCities.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-[#2B1810]">{c.city}</span>
                  <span className="text-[#8B7355]">{c.orders} буюртма</span>
                </div>
                <div className="h-2 bg-[#FBF5EC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B2635] to-[#C9A961] rounded-full transition-all"
                    style={{ width: `${c.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <Card title="Охирги буюртмалар" className="lg:col-span-2">
          <div className="divide-y divide-[#C9A961]/10 -mx-5">
            {recentOrders.map((o) => {
              const status = statusLabels[o.status];
              return (
                <div key={o.id} className="px-5 py-3 flex items-center gap-3 hover:bg-[#FBF5EC]/50 transition">
                  <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">
                    {o.customerAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2B1810]">{o.id}</span>
                      <span className="text-xs text-[#8B7355]">· {o.customer}</span>
                    </div>
                    <div className="text-xs text-[#8B7355] truncate">
                      {o.items.length} та маҳсулот · {o.city}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-[Cormorant_Garamond] text-lg font-bold text-[#8B2635]">
                      {formatPrice(o.total)}
                    </div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="w-full mt-3 py-2 text-sm font-semibold text-[#8B2635] hover:bg-[#FBF5EC] rounded-lg transition">
            Барчасини кўриш →
          </button>
        </Card>

        {/* Top products */}
        <Card title="Топ маҳсулотлар">
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">
                  {p.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-[#2B1810] truncate">{p.name}</div>
                  <div className="text-xs text-[#8B7355] truncate">{p.seller} · {p.sales} сотилди</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-[#8B2635]">{formatShortPrice(p.revenue)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
