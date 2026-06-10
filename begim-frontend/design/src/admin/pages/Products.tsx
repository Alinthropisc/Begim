import { useState } from "react";
import { products, categories, formatPrice, type Product } from "../../data/products";
import { Card, Button, EmptyState } from "../components/UI";
import { Plus, Edit2, Trash2, Star } from "lucide-react";

export default function Products() {
  const [list, setList] = useState<Product[]>(products);
  const [filter, setFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Product | null>(null);

  const filtered = filter === "all" ? list : list.filter((p) => p.category === filter);

  const toggleProduct = (id: string) => {
    setList((prev) => prev.map((p) => p.id === id ? { ...p, badges: p.badges?.includes("Яширин") ? p.badges.filter(b => b !== "Яширин") : [...(p.badges || []), "Яширин"] } : p));
  };

  const deleteProduct = (id: string) => {
    setList((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
          <button
            onClick={() => setFilter("all")}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === "all" ? "bg-[#8B2635] text-[#FBF5EC]" : "bg-white border border-[#C9A961]/30"
            }`}
          >
            Барчаси ({list.length})
          </button>
          {categories.slice(1).map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === c.id ? "bg-[#8B2635] text-[#FBF5EC]" : "bg-white border border-[#C9A961]/30"
              }`}
            >
              {c.emoji} {c.nameUz}
            </button>
          ))}
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setEditing({} as any)}>
          Янги маҳсулот
        </Button>
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="🥮" title="Маҳсулотлар йўқ" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-[#C9A961]/20 overflow-hidden hover:shadow-lg transition">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF5EC]">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {p.badges?.map((b) => (
                    <span key={b} className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      b === "Яширин" ? "bg-gray-500 text-white" :
                      b === "Halol" ? "bg-emerald-600 text-white" :
                      "bg-[#8B2635] text-[#FBF5EC]"
                    }`}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-[#8B7355] mb-1">{p.seller} · {p.sellerCity}</div>
                <h3 className="font-semibold text-sm text-[#2B1810] mb-2 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-xs">
                    <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
                    <span className="font-semibold">{p.rating}</span>
                    <span className="text-[#8B7355]">({p.reviewsCount})</span>
                  </div>
                  <div className="flex-1" />
                  <div className="font-[Cormorant_Garamond] text-lg font-bold text-[#8B2635]">
                    {formatPrice(p.price)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" className="flex-1" icon={<Edit2 className="w-3 h-3" />} onClick={() => setEditing(p)}>
                    Таҳрирлаш
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleProduct(p.id)}>
                    {p.badges?.includes("Яширин") ? "👁️" : "👁️‍🗨️"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => deleteProduct(p.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-up" onClick={() => setEditing(null)}>
          <div className="relative bg-[#FBF5EC] w-full md:max-w-md max-h-[90vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-[#C9A961]/20 flex items-center justify-between">
              <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold text-[#8B2635]">
                {editing.id ? "Таҳрирлаш" : "Янги маҳсулот"}
              </h2>
              <button onClick={() => setEditing(null)} className="w-9 h-9 rounded-full hover:bg-white flex items-center justify-center text-xl">×</button>
            </div>

            <div className="overflow-y-auto p-5 space-y-3">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-[#FBF5EC] border-2 border-dashed border-[#C9A961]/30 flex items-center justify-center text-[#8B7355] text-sm cursor-pointer hover:border-[#C9A961]">
                {editing.image ? (
                  <img src={editing.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📸</div>
                    <div>Расм юклаш</div>
                  </div>
                )}
              </div>

              {[
                { label: "Номи", value: editing.name || "", placeholder: "Самарқандский нон" },
                { label: "Нархи (сўм)", value: editing.price?.toString() || "", placeholder: "18000", type: "number" },
                { label: "Тавсиф", value: editing.description || "", placeholder: "Маҳсулот ҳақида...", multiline: true },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      rows={3}
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B2635] resize-none"
                    />
                  ) : (
                    <input
                      type={f.type || "text"}
                      defaultValue={f.value}
                      placeholder={f.placeholder}
                      className="w-full bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-[#8B2635]"
                    />
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Категория</label>
                  <select className="w-full bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm">
                    {categories.slice(1).map((c) => (
                      <option key={c.id} value={c.id}>{c.nameUz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Halol</label>
                  <label className="flex items-center gap-2 bg-white border border-[#C9A961]/30 rounded-2xl px-4 py-3 text-sm cursor-pointer">
                    <input type="checkbox" defaultChecked={editing.halal} className="accent-[#8B2635]" />
                    Ha, halol
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-[#C9A961]/20 p-4 pb-safe bg-white/50 grid grid-cols-2 gap-2">
              <Button variant="secondary" onClick={() => setEditing(null)}>Бекор қилиш</Button>
              <Button variant="primary" onClick={() => setEditing(null)}>Сақлаш</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
