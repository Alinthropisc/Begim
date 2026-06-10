import { useState } from "react";
import { Card, Button, EmptyState } from "../components/UI";
import { adminCommunityPosts, type AdminCommunityPost } from "../data";
import { Check, X, Flag, Heart, MessageCircle, Eye } from "lucide-react";

export default function Community() {
  const [posts, setPosts] = useState(adminCommunityPosts);
  const [filter, setFilter] = useState<"all" | AdminCommunityPost["status"] | "reported">("all");
  const [preview, setPreview] = useState<AdminCommunityPost | null>(null);

  const filtered = posts.filter((p) => {
    if (filter === "all") return true;
    if (filter === "reported") return p.reported > 0;
    return p.status === filter;
  });

  const updateStatus = (id: string, status: AdminCommunityPost["status"]) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const filters: { id: "all" | AdminCommunityPost["status"] | "reported"; label: string }[] = [
    { id: "all", label: "Барчаси" },
    { id: "pending", label: "Кутилмоқда" },
    { id: "approved", label: "Тасдиқланган" },
    { id: "reported", label: "⚠️ Шикоятлар" },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map((f) => {
          const count = f.id === "all" ? posts.length
            : f.id === "reported" ? posts.filter((p) => p.reported > 0).length
            : posts.filter((p) => p.status === f.id).length;
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

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState icon="💬" title="Постлар йўқ" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const statusColor = p.status === "approved" ? "bg-emerald-100 text-emerald-700"
              : p.status === "rejected" ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-700";

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-[#C9A961]/20 overflow-hidden hover:shadow-lg transition">
                <div className="relative aspect-[4/3] overflow-hidden bg-[#FBF5EC]">
                  <img src={p.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColor}`}>
                      {p.status === "approved" ? "✓ Тасдиқланган" : p.status === "rejected" ? "✗ Рад этилган" : "⏱ Кутилмоқда"}
                    </span>
                    {p.reported > 0 && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-red-600 text-white flex items-center gap-1">
                        <Flag className="w-3 h-3" /> {p.reported} шикоят
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">
                      {p.sellerAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-[#2B1810] truncate">{p.seller}</div>
                      <div className="text-[11px] text-[#8B7355]">{p.createdAt}</div>
                    </div>
                  </div>
                  <p className="text-sm text-[#2B1810] line-clamp-3 mb-3">{p.text}</p>

                  <div className="flex items-center gap-3 text-xs text-[#8B7355] mb-3">
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.likes}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> {p.comments}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <Button variant="secondary" size="sm" onClick={() => setPreview(p)}>
                      <Eye className="w-3 h-3" />
                    </Button>
                    {p.status !== "approved" && (
                      <Button variant="success" size="sm" onClick={() => updateStatus(p.id, "approved")}>
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    {p.status !== "rejected" && (
                      <Button variant="danger" size="sm" onClick={() => updateStatus(p.id, "rejected")}>
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                    {p.status === "approved" && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(p.id, "rejected")}>
                        Ўчириш
                      </Button>
                    )}
                    {p.status === "rejected" && (
                      <Button variant="secondary" size="sm" onClick={() => updateStatus(p.id, "approved")}>
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

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-up" onClick={() => setPreview(null)}>
          <div className="relative bg-[#FBF5EC] w-full md:max-w-md max-h-[90vh] md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreview(null)} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center text-xl">×</button>
            <div className="relative aspect-[4/5] bg-[#2B1810]">
              <img src={preview.image} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-xl">
                  {preview.sellerAvatar}
                </div>
                <div>
                  <div className="font-semibold text-[#2B1810]">{preview.seller}</div>
                  <div className="text-xs text-[#8B7355]">{preview.createdAt}</div>
                </div>
              </div>
              <p className="text-sm text-[#2B1810] leading-relaxed mb-3">{preview.text}</p>
              <div className="flex items-center gap-4 text-sm text-[#8B7355]">
                <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {preview.likes}</span>
                <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> {preview.comments}</span>
                {preview.reported > 0 && (
                  <span className="flex items-center gap-1 text-red-600"><Flag className="w-4 h-4" /> {preview.reported}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
