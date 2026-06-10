import { useState } from "react";
import { Card, Badge } from "../components/UI";
import { Check, Clock, X, CreditCard } from "lucide-react";

type Withdrawal = {
  id: string; sellerName: string; sellerAvatar: string;
  amount: number; method: "payme" | "click"; account: string;
  requestedAt: string; status: "pending" | "paid" | "rejected";
};

const WITHDRAWALS: Withdrawal[] = [
  { id:"w1", sellerName:"Dilnoza Yusupova", sellerAvatar:"👩‍🍳", amount:1240000, method:"payme", account:"9860 1234 5678 9012", requestedAt:"10 min oldin", status:"pending" },
  { id:"w2", sellerName:"Feruza Ergasheva", sellerAvatar:"👩", amount:890000, method:"click", account:"+998901234567", requestedAt:"1 soat oldin", status:"pending" },
  { id:"w3", sellerName:"Mohira Alimova", sellerAvatar:"👩‍🦱", amount:560000, method:"payme", account:"9860 9876 5432 1098", requestedAt:"3 soat oldin", status:"paid" },
  { id:"w4", sellerName:"Zulfiya Xasanova", sellerAvatar:"👩‍🦰", amount:320000, method:"click", account:"+998909876543", requestedAt:"1 kun oldin", status:"paid" },
  { id:"w5", sellerName:"Nasiba Karimova", sellerAvatar:"👩‍🎤", amount:150000, method:"payme", account:"9860 1111 2222 3333", requestedAt:"2 kun oldin", status:"rejected" },
];

const fp = (n: number) => n.toLocaleString("ru") + " so'm";

const statusConf = {
  pending:  { uz:"Kutilmoqda", ru:"Ожидает",   color:"bg-amber-50 text-amber-700 border-amber-200" },
  paid:     { uz:"To'landi",   ru:"Выплачено", color:"bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { uz:"Rad etildi", ru:"Отклонено", color:"bg-red-50 text-red-700 border-red-200" },
};

export default function Payments({ lang }: { lang: "uz" | "ru" }) {
  const [items, setItems] = useState(WITHDRAWALS);
  const [filter, setFilter] = useState<Withdrawal["status"] | "all">("all");
  const uz = lang === "uz";

  const update = (id: string, status: Withdrawal["status"]) =>
    setItems(p => p.map(w => w.id === id ? { ...w, status } : w));

  const filtered = filter === "all" ? items : items.filter(w => w.status === filter);
  const totalPending = items.filter(w => w.status === "pending").reduce((s, w) => s + w.amount, 0);
  const totalPaid = items.filter(w => w.status === "paid").reduce((s, w) => s + w.amount, 0);
  const commission = Math.round(items.filter(w=>w.status==="paid").reduce((s,w)=>s+w.amount,0) * 0.05);

  const kpis = [
    { label: uz?"Umumiy aylanma":"Общий оборот",      value: fp(18_420_000), icon:"💰", color:"from-[#8B2635] to-[#C9A961]" },
    { label: uz?"Kutilayotgan to'lov":"Ожидают выплат", value: fp(totalPending), icon:"⏳", color:"from-[#6B3F1A] to-[#C9A961]" },
    { label: uz?"To'langan (oy)":"Выплачено (месяц)",   value: fp(totalPaid),   icon:"✅", color:"from-[#2D5F4E] to-[#16a34a]" },
    { label: uz?"Komissiya (5%)":"Комиссия (5%)",        value: fp(commission),  icon:"📊", color:"from-[#1a3a5c] to-[#2563eb]" },
  ];

  const filters: { id: Withdrawal["status"] | "all"; uz: string; ru: string }[] = [
    { id:"all",      uz:"Barchasi",   ru:"Все" },
    { id:"pending",  uz:"Kutilmoqda", ru:"Ожидают" },
    { id:"paid",     uz:"To'langan",  ru:"Выплачено" },
    { id:"rejected", uz:"Rad etilgan",ru:"Отклонено" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="font-bold text-lg leading-tight">{k.value}</div>
            <div className="text-xs opacity-80 mt-1 leading-tight">{k.label}</div>
          </div>
        ))}
      </div>

      <Card title={uz ? "To'lov usullari ulushi" : "Доли платёжных систем"}>
        <div className="grid grid-cols-2 gap-4">
          {[{name:"Payme", pct:62, color:"bg-blue-500"}, {name:"Click", pct:38, color:"bg-yellow-500"}].map(m => (
            <div key={m.name} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1"><span className="font-medium">{m.name}</span><span className="text-[#8B7355]">{m.pct}%</span></div>
                <div className="h-2 bg-[#FBF5EC] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${m.color}`} style={{width:`${m.pct}%`}} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map(f => {
          const count = f.id === "all" ? items.length : items.filter(w => w.status === f.id).length;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter===f.id ? "bg-[#8B2635] text-white" : "bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"}`}>
              {uz?f.uz:f.ru} <span className="opacity-60 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map(w => {
          const sc = statusConf[w.status];
          return (
            <div key={w.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">{w.sellerAvatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#2B1810]">{w.sellerName}</span>
                    <Badge className={sc.color}>{uz?sc.uz:sc.ru}</Badge>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${w.method==="payme"?"bg-blue-100 text-blue-700":"bg-yellow-100 text-yellow-700"}`}>
                      {w.method === "payme" ? "🟦 Payme" : "🟨 Click"}
                    </span>
                  </div>
                  <div className="text-sm text-[#8B7355] mt-0.5 flex items-center gap-2">
                    <CreditCard className="w-3 h-3" /> {w.account}
                  </div>
                  <div className="text-xs text-[#8B7355] flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {w.requestedAt}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#8B2635]">{fp(w.amount)}</div>
                </div>
              </div>
              {w.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#C9A961]/10">
                  <button type="button" onClick={() => update(w.id, "paid")}
                    className="flex-1 bg-[#2D5F4E] text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> {uz?"To'lash":"Выплатить"}
                  </button>
                  <button type="button" onClick={() => update(w.id, "rejected")}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <X className="w-4 h-4" /> {uz?"Rad etish":"Отклонить"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
