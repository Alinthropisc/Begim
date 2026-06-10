import { useState } from "react";
import { Card, Badge, Button, EmptyState } from "../components/UI";
import { adminOrders, formatPrice, statusLabels, type AdminOrder } from "../data";
import { Download } from "lucide-react";

function exportCSV(data: AdminOrder[]) {
  const headers = ["ID","Мижоз","Сотувчи","Шаҳар","Сумма","Статус","Вақт","Тўлов"];
  const rows = data.map(o => [o.id, o.customer, o.seller, o.city, o.total, o.status, o.createdAt, o.paymentMethod]);
  const csv = [headers, ...rows].map(r => r.join(";")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `begim_orders_${Date.now()}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export default function Orders() {
  const [orders, setOrders] = useState(adminOrders);
  const [filter, setFilter] = useState<AdminOrder["status"] | "all">("all");
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  const updateStatus = (id: string, status: AdminOrder["status"]) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filters: { id: AdminOrder["status"] | "all"; label: string }[] = [
    { id:"all",        label:"Барчаси" },
    { id:"new",        label:"Янги" },
    { id:"processing", label:"Тайёрланмоқда" },
    { id:"delivering", label:"Йўлда" },
    { id:"delivered",  label:"Етказилди" },
    { id:"cancelled",  label:"Бекор" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Filter pills + export */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 flex-1">
          {filters.map(f => {
            const count = f.id === "all" ? orders.length : orders.filter(o => o.status === f.id).length;
            return (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === f.id ? "bg-[#8B2635] text-[#FBF5EC]" : "bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
                }`}>
                {f.label} <span className="opacity-70 ml-1">({count})</span>
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => exportCSV(filtered)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961] transition">
          <Download className="w-4 h-4" /> CSV
        </button>
      </div>

      {/* Orders table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="Буюртмалар йўқ" description="Фильтрни ўзгартиринг" />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-xs uppercase text-[#8B7355] border-b border-[#C9A961]/20">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="py-3 font-semibold">Мижоз</th>
                  <th className="py-3 font-semibold">Сотувчи</th>
                  <th className="py-3 font-semibold">Шаҳар</th>
                  <th className="py-3 font-semibold">Сумма</th>
                  <th className="py-3 font-semibold">Статус</th>
                  <th className="py-3 font-semibold">Вақт</th>
                  <th className="py-3 font-semibold text-right pr-5">Амал</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => {
                  const status = statusLabels[o.status];
                  return (
                    <tr key={o.id} className="border-b border-[#C9A961]/10 hover:bg-[#FBF5EC]/50 transition">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-[#8B2635]">{o.id}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#FBF5EC] flex items-center justify-center text-sm">{o.customerAvatar}</div>
                          <span className="font-medium text-[#2B1810]">{o.customer}</span>
                        </div>
                      </td>
                      <td className="py-3 text-[#2B1810]">{o.seller}</td>
                      <td className="py-3 text-[#8B7355]">{o.city}</td>
                      <td className="py-3 font-bold text-[#2B1810]">{formatPrice(o.total)}</td>
                      <td className="py-3"><Badge className={status.color}>{status.label}</Badge></td>
                      <td className="py-3 text-[#8B7355] text-xs">{o.createdAt}</td>
                      <td className="py-3 text-right pr-5">
                        <Button variant="secondary" size="sm" onClick={() => setSelected(o)}>Тафсилотлар</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setSelected(null)}>
          <div className="relative bg-[#FBF5EC] w-full md:max-w-lg max-h-[90vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-[#C9A961]/20 flex items-center justify-between">
              <div>
                <div className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">Буюртма {selected.id}</div>
                <div className="text-xs text-[#8B7355]">{selected.createdAt}</div>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-xl">×</button>
            </div>

            <div className="overflow-y-auto p-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                <div className="text-xs font-semibold text-[#8B7355] uppercase mb-2">Мижоз</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#FBF5EC] flex items-center justify-center text-2xl">{selected.customerAvatar}</div>
                  <div>
                    <div className="font-semibold text-[#2B1810]">{selected.customer}</div>
                    <div className="text-xs text-[#8B7355]">📍 {selected.city}</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                <div className="text-xs font-semibold text-[#8B7355] uppercase mb-2">Сотувчи</div>
                <div className="font-semibold text-[#2B1810]">👩‍🍳 {selected.seller}</div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                <div className="text-xs font-semibold text-[#8B7355] uppercase mb-3">Маҳсулотлар</div>
                <div className="space-y-2">
                  {selected.items.map((it, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-[#2B1810]">{it.name}</div>
                        <div className="text-xs text-[#8B7355]">{it.qty} × {formatPrice(it.price)}</div>
                      </div>
                      <div className="font-bold text-[#2B1810]">{formatPrice(it.qty * it.price)}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-[#C9A961]/10 flex justify-between">
                  <span className="font-semibold">Жами:</span>
                  <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#8B2635]">{formatPrice(selected.total)}</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20">
                <div className="text-xs font-semibold text-[#8B7355] uppercase mb-2">Тўлов усули</div>
                <div className="font-medium text-[#2B1810]">
                  {selected.paymentMethod === "telegram" && "💎 Telegram Payments"}
                  {selected.paymentMethod === "card"     && "💳 Пластик карта"}
                  {selected.paymentMethod === "cash"     && "💵 Нақд пул"}
                </div>
              </div>
            </div>

            <div className="border-t border-[#C9A961]/20 p-4 pb-safe space-y-2 bg-white/50">
              <div className="grid grid-cols-2 gap-2">
                {selected.status === "new" && (
                  <>
                    <Button variant="success" onClick={() => updateStatus(selected.id, "processing")}>✓ Тасдиқлаш</Button>
                    <Button variant="danger"  onClick={() => updateStatus(selected.id, "cancelled")}>✗ Бекор қилиш</Button>
                  </>
                )}
                {selected.status === "processing" && (
                  <Button variant="primary" className="col-span-2" onClick={() => updateStatus(selected.id, "delivering")}>🚚 Йўлга чиқариш</Button>
                )}
                {selected.status === "delivering" && (
                  <Button variant="success" className="col-span-2" onClick={() => updateStatus(selected.id, "delivered")}>✓ Етказилди деб белгилаш</Button>
                )}
                {(selected.status === "delivered" || selected.status === "cancelled") && (
                  <Button variant="secondary" className="col-span-2" onClick={() => setSelected(null)}>Ёпиш</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
