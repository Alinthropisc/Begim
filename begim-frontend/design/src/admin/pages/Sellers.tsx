import { useState } from "react";
import { Card, Badge, Button, EmptyState } from "../components/UI";
import { adminSellers, sellerStatusLabels, type AdminSeller } from "../data";
import { Check, X, Star, Shield, MapPin, Phone, Award } from "lucide-react";

export default function Sellers() {
  const [sellers, setSellers] = useState(adminSellers);
  const [filter, setFilter] = useState<AdminSeller["status"] | "all">("all");
  const [selected, setSelected] = useState<AdminSeller | null>(null);

  const filtered = filter === "all" ? sellers : sellers.filter((s) => s.status === filter);

  const updateStatus = (id: string, status: AdminSeller["status"]) => {
    setSellers((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    if (selected?.id === id) setSelected({ ...selected, status });
  };

  const filters: { id: AdminSeller["status"] | "all"; label: string }[] = [
    { id: "all", label: "Барчаси" },
    { id: "pending", label: "Кутилмоқда" },
    { id: "active", label: "Фаол" },
    { id: "blocked", label: "Блокланган" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const count = f.id === "all" ? sellers.length : sellers.filter((s) => s.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.id
                  ? "bg-[#8B2635] text-[#FBF5EC]"
                  : "bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
              }`}
            >
              {f.label} <span className="opacity-70 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="👩‍🍳" title="Сотувчилар йўқ" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const status = sellerStatusLabels[s.status];
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-[#C9A961]/20 p-5 hover:shadow-lg transition cursor-pointer"
                onClick={() => setSelected(s)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B2635] to-[#6B1A27] flex items-center justify-center text-3xl flex-shrink-0 shadow-md">
                    {s.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#2B1810] truncate">{s.name}</h3>
                      {s.verified && <Shield className="w-4 h-4 text-[#229ED9]" />}
                    </div>
                    <div className="text-xs text-[#8B7355] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {s.city}
                    </div>
                    <div className="text-xs text-[#8B7355] flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {s.phone}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge className="bg-[#FBF5EC] text-[#2B1810] border-[#C9A961]/30">{s.category}</Badge>
                  {s.halal && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">✓ Halol</Badge>}
                  <Badge className={status.color}>{status.label}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#C9A961]/10 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
                      <span className="text-sm font-bold text-[#2B1810]">{s.rating || "—"}</span>
                    </div>
                    <div className="text-[10px] text-[#8B7355]">Рейтинг</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2B1810]">{s.totalSales}</div>
                    <div className="text-[10px] text-[#8B7355]">Сотилди</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#2B1810]">{s.productsCount}</div>
                    <div className="text-[10px] text-[#8B7355]">Маҳсулот</div>
                  </div>
                </div>

                {s.status === "pending" && (
                  <div className="mt-3 pt-3 border-t border-[#C9A961]/10 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => updateStatus(s.id, "active")}
                      icon={<Check className="w-3 h-3" />}
                    >
                      Тасдиқлаш
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateStatus(s.id, "blocked")}
                      icon={<X className="w-3 h-3" />}
                    >
                      Рад этиш
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Seller details modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setSelected(null)}>
          <div className="relative bg-[#FBF5EC] w-full md:max-w-md max-h-[90vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="relative begim-pattern-dark text-[#FBF5EC] p-6 pt-10 text-center">
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">×</button>
              <div className="w-20 h-20 rounded-full bg-[#FBF5EC] flex items-center justify-center text-4xl mx-auto mb-3 shadow-xl">
                {selected.avatar}
              </div>
              <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold">{selected.name}</h2>
              <div className="text-sm text-[#E4CE8A] flex items-center justify-center gap-1 mt-1">
                <MapPin className="w-3 h-3" /> {selected.city}
              </div>
              {selected.verified && (
                <div className="inline-flex items-center gap-1 mt-2 bg-[#229ED9] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Shield className="w-3 h-3" /> Верифицирован
                </div>
              )}
            </div>

            <div className="overflow-y-auto p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-3 text-center border border-[#C9A961]/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 fill-[#C9A961] text-[#C9A961]" />
                    <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#2B1810]">{selected.rating || "—"}</span>
                  </div>
                  <div className="text-[10px] text-[#8B7355] uppercase">Рейтинг</div>
                </div>
                <div className="bg-white rounded-xl p-3 text-center border border-[#C9A961]/20">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Award className="w-4 h-4 text-[#8B2635]" />
                    <span className="font-[Cormorant_Garamond] text-2xl font-bold text-[#2B1810]">{selected.totalSales}</span>
                  </div>
                  <div className="text-[10px] text-[#8B7355] uppercase">Сотилди</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-[#C9A961]/20 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Телефон:</span>
                  <span className="font-semibold text-[#2B1810]">{selected.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Категория:</span>
                  <span className="font-semibold text-[#2B1810]">{selected.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Маҳсулотлар:</span>
                  <span className="font-semibold text-[#2B1810]">{selected.productsCount} та</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8B7355]">Қўшилган:</span>
                  <span className="font-semibold text-[#2B1810]">{selected.joinedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#8B7355]">Halol сертификат:</span>
                  {selected.halal ? (
                    <span className="text-emerald-700 font-semibold">✓ Бор</span>
                  ) : (
                    <span className="text-[#8B7355]">Йўқ</span>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-[#C9A961]/20 p-4 pb-safe space-y-2 bg-white/50">
              {selected.status === "pending" && (
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="success" onClick={() => updateStatus(selected.id, "active")}>
                    <Check className="w-4 h-4" /> Тасдиқлаш
                  </Button>
                  <Button variant="danger" onClick={() => updateStatus(selected.id, "blocked")}>
                    <X className="w-4 h-4" /> Рад этиш
                  </Button>
                </div>
              )}
              {selected.status === "active" && (
                <Button variant="danger" className="w-full" onClick={() => updateStatus(selected.id, "blocked")}>
                  Блоклаш
                </Button>
              )}
              {selected.status === "blocked" && (
                <Button variant="success" className="w-full" onClick={() => updateStatus(selected.id, "active")}>
                  Блокдан чиқариш
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
