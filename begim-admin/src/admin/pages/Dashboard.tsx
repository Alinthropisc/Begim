import { useState } from "react";
import { Card, StatCard, Badge } from "../components/UI";
import { periodStats, chartData, topCities, topProducts, adminOrders, formatPrice, formatShortPrice, statusLabels, type PeriodKey } from "../data";

const periodLabels: Record<PeriodKey, string> = { today:"Бугун", week:"Ҳафта", month:"Ой" };
const chartTitles: Record<PeriodKey, string> = { today:"Бугунги соатлик сотувлар", week:"Ҳафталик сотувлар", month:"Ойлик сотувлар" };

export default function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("today");
  const s = periodStats[period];
  const chart = chartData[period];
  const maxVal = Math.max(...chart.map(c => c.value));
  const recentOrders = adminOrders.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Period toggle */}
      <div className="flex gap-1 bg-white border border-[#C9A961]/20 rounded-2xl p-1 shadow-sm w-fit">
        {(["today","week","month"] as PeriodKey[]).map(p => (
          <button key={p} type="button" onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${period===p ? "bg-[#8B2635] text-white shadow" : "text-[#8B7355] hover:text-[#2B1810]"}`}>
            {periodLabels[p]}
          </button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={`Буюртмалар (${periodLabels[period].toLowerCase()})`} value={s.orders}        delta={s.ordersDelta}   icon="📦" color="bordeaux" />
        <StatCard label={`Даромад (${periodLabels[period].toLowerCase()})`}    value={formatShortPrice(s.revenue)+" so'm"} delta={s.revenueDelta} icon="💰" color="gold"     />
        <StatCard label="Фаол сотувчилар"   value={127}                      delta={3}               icon="👩‍🍳" color="emerald" />
        <StatCard label="Янги фойдаланувчи" value={s.newUsers.toLocaleString()} delta={s.newUsersDelta} icon="👥" color="dark"    />
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label:"Кутилаётган шарҳлар", count:8, color:"bg-amber-50 border-amber-200 text-amber-800",  icon:"⭐" },
          { label:"Янги сотувчилар",     count:2, color:"bg-blue-50 border-blue-200 text-blue-800",      icon:"👩‍🍳" },
          { label:"Шикоятлар",           count:3, color:"bg-red-50 border-red-200 text-red-800",         icon:"⚠️" },
        ].map((a, i) => (
          <div key={i} className={`rounded-2xl border p-4 flex items-center gap-3 ${a.color}`}>
            <div className="text-2xl">{a.icon}</div>
            <div className="flex-1">
              <div className="text-xs font-medium">{a.label}</div>
              <div className="font-[Cormorant_Garamond] text-2xl font-bold">{a.count}</div>
            </div>
            <button type="button" className="text-xs font-semibold underline">Кўриш</button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card title={chartTitles[period]} className="lg:col-span-2">
          <div className="flex items-end gap-2 h-48">
            {chart.map((c, i) => {
              const height = (c.value / maxVal) * 100;
              const isPeak = c.value === maxVal;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-semibold text-[#8B7355] opacity-0 group-hover:opacity-100 transition">
                    {formatShortPrice(c.value)}
                  </div>
                  <div className="flex-1 w-full flex items-end">
                    <div className={`w-full rounded-t-lg transition-all cursor-pointer ${isPeak ? "bg-gradient-to-t from-[#8B2635] to-[#E4CE8A]" : "bg-gradient-to-t from-[#8B2635] to-[#C9A961] hover:from-[#6B1A27] hover:to-[#E4CE8A]"}`}
                      style={{ height: `${height}%` }} />
                  </div>
                  <div className="text-[10px] font-medium text-[#8B7355]">{c.day}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-[#C9A961]/10 flex items-center justify-between text-sm">
            <div className="flex items-center gap-3 text-[#8B7355]">
              <span>Жами:</span>
              <span className="text-xs bg-[#2D5F4E]/10 text-[#2D5F4E] px-2 py-0.5 rounded-full font-semibold">
                ↑ {s.revenueDelta}% ўтган давр
              </span>
            </div>
            <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#8B2635]">
              {formatPrice(chart.reduce((sum, c) => sum + c.value, 0))}
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
                  <div className="h-full bg-gradient-to-r from-[#8B2635] to-[#C9A961] rounded-full transition-all" style={{ width:`${c.percent}%` }} />
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
                  <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">{o.customerAvatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2B1810]">{o.id}</span>
                      <span className="text-xs text-[#8B7355]">· {o.customer}</span>
                    </div>
                    <div className="text-xs text-[#8B7355] truncate">{o.items.length} та маҳсулот · {o.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-[Cormorant_Garamond] text-lg font-bold text-[#8B2635]">{formatPrice(o.total)}</div>
                    <Badge className={status.color}>{status.label}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" className="w-full mt-3 py-2 text-sm font-semibold text-[#8B2635] hover:bg-[#FBF5EC] rounded-lg transition">
            Барчасини кўриш →
          </button>
        </Card>

        <div className="space-y-4">
          {/* Conversion */}
          <div className="bg-gradient-to-br from-[#8B2635] to-[#C9A961] rounded-2xl p-4 text-white">
            <div className="text-xs opacity-80 mb-1">Конверсия</div>
            <div className="font-[Cormorant_Garamond] text-4xl font-bold">{s.conversion}%</div>
            <div className="text-xs opacity-70 mt-1">кўришдан буюртмага</div>
          </div>

          {/* Top products */}
          <Card title="Топ маҳсулотлар">
            <div className="space-y-3">
              {topProducts.slice(0, 4).map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-xl flex-shrink-0">{p.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs text-[#2B1810] truncate">{p.name}</div>
                    <div className="text-[10px] text-[#8B7355]">{p.sales} сотилди</div>
                  </div>
                  <div className="text-xs font-bold text-[#8B2635]">{formatShortPrice(p.revenue)}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
