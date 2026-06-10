import { Card } from "../components/UI";
import { weeklySales, topCities, topProducts, formatShortPrice, formatPrice } from "../data";

export default function Analytics() {
  const totalWeekSales = weeklySales.reduce((s, x) => s + x.value, 0);
  const maxSale = Math.max(...weeklySales.map((s) => s.value));

  // Line chart data
  const maxCity = Math.max(...topCities.map((c) => c.orders));

  return (
    <div className="space-y-6 animate-fade-up">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Конверсия", value: "4.2%", sub: "+0.8% за неделю", color: "text-emerald-600" },
          { label: "Ўрта чек", value: formatPrice(145000), sub: "+12%", color: "text-emerald-600" },
          { label: "Фаол фойдаланувчи", value: "2,491", sub: "бугун", color: "text-[#8B7355]" },
          { label: "Қайтиш даражаси", value: "68%", sub: "30 кун ичида", color: "text-emerald-600" },
        ].map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#C9A961]/20 p-5">
            <div className="text-xs text-[#8B7355] uppercase tracking-wide mb-1">{k.label}</div>
            <div className="font-[Cormorant_Garamond] text-3xl font-bold text-[#2B1810]">{k.value}</div>
            <div className={`text-xs mt-1 ${k.color}`}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales line chart */}
        <Card title="Сотувлар динамикаси (7 кун)">
          <div className="relative h-64">
            {/* Y axis labels */}
            <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-[10px] text-[#8B7355]">
              <span>{formatShortPrice(maxSale)}</span>
              <span>{formatShortPrice(maxSale / 2)}</span>
              <span>0</span>
            </div>
            {/* Chart */}
            <div className="absolute left-14 top-0 right-0 bottom-8">
              <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B2635" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#8B2635" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area */}
                <path
                  d={`M 0 ${100 - (weeklySales[0].value / maxSale) * 90} ${weeklySales.map((s, i) => `L ${(i / (weeklySales.length - 1)) * 100} ${100 - (s.value / maxSale) * 90}`).join(" ")} L 100 100 L 0 100 Z`}
                  fill="url(#lineGradient)"
                />
                {/* Line */}
                <path
                  d={`M ${weeklySales.map((s, i) => `${(i / (weeklySales.length - 1)) * 100} ${100 - (s.value / maxSale) * 90}`).join(" L ")}`}
                  fill="none"
                  stroke="#8B2635"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Points */}
                {weeklySales.map((s, i) => (
                  <circle
                    key={i}
                    cx={(i / (weeklySales.length - 1)) * 100}
                    cy={100 - (s.value / maxSale) * 90}
                    r="1.5"
                    fill="#8B2635"
                  />
                ))}
              </svg>
            </div>
            {/* X axis */}
            <div className="absolute left-14 right-0 bottom-0 flex justify-between text-xs text-[#8B7355]">
              {weeklySales.map((s) => <span key={s.day}>{s.day}</span>)}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#C9A961]/10 flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-[#8B7355]">Ҳафталик жами</div>
              <div className="font-[Cormorant_Garamond] text-2xl font-bold text-[#8B2635]">{formatPrice(totalWeekSales)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#8B7355]">Ўртача/кун</div>
              <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#2B1810]">{formatPrice(Math.round(totalWeekSales / 7))}</div>
            </div>
          </div>
        </Card>

        {/* Cities bar chart */}
        <Card title="Шаҳарлар бўйича">
          <div className="space-y-3">
            {topCities.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold text-[#2B1810]">{c.city}</span>
                  <div className="text-xs text-[#8B7355]">
                    <span className="font-bold text-[#8B2635]">{c.orders}</span> · {c.percent}%
                  </div>
                </div>
                <div className="h-3 bg-[#FBF5EC] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#8B2635] via-[#C9A961] to-[#E4CE8A] rounded-full transition-all duration-1000"
                    style={{ width: `${(c.orders / maxCity) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top products */}
        <Card title="Топ маҳсулотлар (30 кун)" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-xs uppercase text-[#8B7355] border-b border-[#C9A961]/20">
                  <th className="px-5 py-3 font-semibold">#</th>
                  <th className="py-3 font-semibold">Маҳсулот</th>
                  <th className="py-3 font-semibold">Сотувчи</th>
                  <th className="py-3 font-semibold text-right">Сотилди</th>
                  <th className="py-3 font-semibold text-right pr-5">Даромад</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} className="border-b border-[#C9A961]/10 hover:bg-[#FBF5EC]/50">
                    <td className="px-5 py-3">
                      <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? "bg-[#C9A961] text-[#2B1810]" : "bg-[#FBF5EC] text-[#8B7355]"
                      }`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{p.emoji}</span>
                        <span className="font-semibold text-[#2B1810]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-[#8B7355]">{p.seller}</td>
                    <td className="py-3 text-right font-semibold">{p.sales}</td>
                    <td className="py-3 text-right font-bold text-[#8B2635] pr-5">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
