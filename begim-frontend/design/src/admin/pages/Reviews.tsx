import { useState } from "react";
import { Card, Badge, Button, EmptyState } from "../components/UI";
import { adminReviews, reviewStatusLabels, type AdminReview } from "../data";
import { Check, X, Flag, Star } from "lucide-react";

export default function Reviews() {
  const [reviews, setReviews] = useState(adminReviews);
  const [filter, setFilter] = useState<AdminReview["status"] | "all" | "reported">("all");

  const filtered = reviews.filter((r) => {
    if (filter === "all") return true;
    if (filter === "reported") return r.reported;
    return r.status === filter;
  });

  const updateStatus = (id: string, status: AdminReview["status"]) => {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const filters: { id: AdminReview["status"] | "all" | "reported"; label: string }[] = [
    { id: "all", label: "Барчаси" },
    { id: "pending", label: "Кутилмоқда" },
    { id: "approved", label: "Тасдиқланган" },
    { id: "rejected", label: "Рад этилган" },
    { id: "reported", label: "⚠️ Шикоятлар" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const count = f.id === "all" ? reviews.length
            : f.id === "reported" ? reviews.filter((r) => r.reported).length
            : reviews.filter((r) => r.status === f.id).length;
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

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="⭐" title="Шарҳлар йўқ" description="Бу категорияда шарҳлар топилмади" />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const status = reviewStatusLabels[r.status];
            return (
              <div key={r.id} className="bg-white rounded-2xl border border-[#C9A961]/20 p-5 hover:shadow-md transition">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">
                    {r.authorAvatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-[#2B1810]">{r.author}</span>
                      <span className="text-xs text-[#8B7355]">→</span>
                      <span className="text-sm text-[#8B2635] font-medium">{r.product}</span>
                      {r.reported && (
                        <Badge className="bg-red-50 text-red-700 border-red-200">
                          <Flag className="w-3 h-3" /> Шикоят
                        </Badge>
                      )}
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} className={`w-3.5 h-3.5 ${n <= r.rating ? "fill-[#C9A961] text-[#C9A961]" : "text-[#C9A961]/30"}`} />
                      ))}
                      <span className="text-xs text-[#8B7355] ml-2">· {r.date}</span>
                    </div>
                    <p className="text-sm text-[#2B1810] leading-relaxed mb-3">{r.text}</p>

                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="success" size="sm" onClick={() => updateStatus(r.id, "approved")} icon={<Check className="w-3 h-3" />}>
                          Тасдиқлаш
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => updateStatus(r.id, "rejected")} icon={<X className="w-3 h-3" />}>
                          Рад этиш
                        </Button>
                      </div>
                    )}
                    {r.status === "approved" && (
                      <Button variant="danger" size="sm" onClick={() => updateStatus(r.id, "rejected")}>
                        Ўчириш
                      </Button>
                    )}
                    {r.status === "rejected" && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(r.id, "approved")}>
                        Қайта тиклаш
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
