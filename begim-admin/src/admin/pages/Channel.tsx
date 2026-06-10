import { useState } from "react";
import { Card, Badge } from "../components/UI";
import { Check, Clock, Send, Eye, Heart, AlertCircle } from "lucide-react";

type ChannelPost = {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  productName: string;
  productEmoji: string;
  price: number;
  description: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected" | "posted";
  scheduledAt?: string;
  postedAt?: string;
  views?: number;
  likes?: number;
};

const MOCK_POSTS: ChannelPost[] = [
  {
    id: "cp1", sellerName: "Dilnoza Yusupova", sellerAvatar: "👩‍🍳",
    productName: "Napoleon torti", productEmoji: "🎂", price: 95000,
    description: "Klassik Napoleon torti — 12 qatlam pishloq kremi bilan. Buyurtma asosida tayyorlanadi.",
    submittedAt: "10 min oldin", status: "pending",
  },
  {
    id: "cp2", sellerName: "Feruza Ergasheva", sellerAvatar: "👩",
    productName: "Samarqand noni", productEmoji: "🫓", price: 18000,
    description: "Haqiqiy tandir noni, issiq-issiq. Kechqurun soat 18:00 gacha yetkazib beramiz.",
    submittedAt: "45 min oldin", status: "approved", scheduledAt: "Bugun 18:00",
  },
  {
    id: "cp3", sellerName: "Mohira Alimova", sellerAvatar: "👩‍🦱",
    productName: "Somsa (x6)", productEmoji: "🥟", price: 30000,
    description: "Go'sht va piyoz bilan tayyorlangan somsa — 6 dona. Har kuni yangi.",
    submittedAt: "2 soat oldin", status: "posted", postedAt: "Bugun 10:30", views: 1240, likes: 89,
  },
  {
    id: "cp4", sellerName: "Zulfiya Xasanova", sellerAvatar: "👩‍🦰",
    productName: "Gaz-payvand pechene", productEmoji: "🍪", price: 45000,
    description: "Qo'l bilan yasalgan pechene — sovg'a qutisi bilan ham jo'natamiz.",
    submittedAt: "3 soat oldin", status: "rejected",
  },
];

const formatPrice = (p: number) =>
  p >= 1000 ? `${(p / 1000).toFixed(0)} 000 so'm` : `${p} so'm`;

const statusConfig: Record<ChannelPost["status"], { label: string; labelRu: string; color: string }> = {
  pending:  { label: "Kutilmoqda",  labelRu: "Ожидает",    color: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Tasdiqlandi", labelRu: "Одобрено",   color: "bg-blue-50 text-blue-700 border-blue-200" },
  rejected: { label: "Rad etildi",  labelRu: "Отклонено",  color: "bg-red-50 text-red-700 border-red-200" },
  posted:   { label: "Chiqarildi",  labelRu: "Опубликовано", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

export default function Channel({ lang }: { lang: "uz" | "ru" }) {
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [filter, setFilter] = useState<ChannelPost["status"] | "all">("all");
  const uz = lang === "uz";

  const filtered = filter === "all" ? posts : posts.filter((p) => p.status === filter);

  const updateStatus = (id: string, status: ChannelPost["status"]) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));

  const stats = [
    { label: uz ? "Kanalga abunachilari" : "Подписчиков канала", value: "4 820", icon: "📣", color: "from-[#8B2635] to-[#C9A961]" },
    { label: uz ? "Bugun ko'rishlar"     : "Просмотров сегодня", value: "3 140", icon: "👁",  color: "from-[#1a3a5c] to-[#2563eb]" },
    { label: uz ? "Kutilayotgan postlar" : "Ожидают публикации", value: posts.filter(p=>p.status==="pending").toString().split(",").length.toString(), icon: "⏳", color: "from-[#6B3F1A] to-[#C9A961]" },
    { label: uz ? "Bugun chiqarildi"     : "Опубликовано сегодня", value: posts.filter(p=>p.status==="posted").length.toString(), icon: "✅", color: "from-[#2D5F4E] to-[#16a34a]" },
  ];

  const filterItems: { id: ChannelPost["status"] | "all"; uz: string; ru: string }[] = [
    { id: "all",      uz: "Barchasi",   ru: "Все" },
    { id: "pending",  uz: "Kutilmoqda", ru: "Ожидают" },
    { id: "approved", uz: "Tasdiqlangan", ru: "Одобренные" },
    { id: "posted",   uz: "Chiqarilgan", ru: "Опубликованные" },
    { id: "rejected", uz: "Rad etilgan", ru: "Отклонённые" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Channel stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="font-bold text-xl">{s.value}</div>
            <div className="text-xs opacity-80 mt-0.5 leading-tight">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Channel info */}
      <Card title={uz ? "Kanal ma'lumotlari" : "Информация о канале"}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B2635] to-[#C9A961] flex items-center justify-center text-3xl">📣</div>
          <div className="flex-1">
            <div className="font-semibold text-[#2B1810]">@BeegimUz</div>
            <div className="text-sm text-[#8B7355]">4 820 {uz ? "obunachi" : "подписчиков"} · {uz ? "Ochiq kanal" : "Публичный канал"}</div>
          </div>
          <a href="https://t.me/BeegimUz" target="_blank" rel="noreferrer"
            className="text-xs font-semibold text-[#8B2635] border border-[#8B2635]/20 px-4 py-2 rounded-full hover:bg-[#8B2635]/5 transition flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5" /> {uz ? "Ochish" : "Открыть"}
          </a>
        </div>
      </Card>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filterItems.map((f) => {
          const count = f.id === "all" ? posts.length : posts.filter((p) => p.status === f.id).length;
          return (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f.id ? "bg-[#8B2635] text-white" : "bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"
              }`}>
              {uz ? f.uz : f.ru} <span className="opacity-60 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filtered.map((post) => {
          const sc = statusConfig[post.status];
          return (
            <div key={post.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-2xl flex-shrink-0">
                  {post.productEmoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#2B1810]">{post.productName}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm">{post.sellerAvatar}</span>
                        <span className="text-sm text-[#8B7355]">{post.sellerName}</span>
                        <span className="text-[#C9A961]/40">·</span>
                        <span className="text-sm font-semibold text-[#8B2635]">{formatPrice(post.price)}</span>
                      </div>
                    </div>
                    <Badge className={sc.color}>{uz ? sc.label : sc.labelRu}</Badge>
                  </div>
                  <p className="text-sm text-[#8B7355] mt-2 line-clamp-2">{post.description}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-[#8B7355]">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.submittedAt}</span>
                    {post.postedAt && <span className="flex items-center gap-1"><Check className="w-3 h-3 text-emerald-500" /> {post.postedAt}</span>}
                    {post.views && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {post.views.toLocaleString()}</span>}
                    {post.likes && <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes}</span>}
                    {post.scheduledAt && <span className="flex items-center gap-1 text-blue-600"><AlertCircle className="w-3 h-3" /> {post.scheduledAt}</span>}
                  </div>
                </div>
              </div>

              {post.status === "pending" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#C9A961]/10">
                  <button type="button" onClick={() => updateStatus(post.id, "approved")}
                    className="flex-1 bg-[#2D5F4E] text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Check className="w-4 h-4" /> {uz ? "Tasdiqlash" : "Одобрить"}
                  </button>
                  <button type="button" onClick={() => updateStatus(post.id, "rejected")}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> {uz ? "Rad etish" : "Отклонить"}
                  </button>
                </div>
              )}
              {post.status === "approved" && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-[#C9A961]/10">
                  <button type="button" onClick={() => updateStatus(post.id, "posted")}
                    className="flex-1 bg-gradient-to-r from-[#8B2635] to-[#C9A961] text-white rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5">
                    <Send className="w-4 h-4" /> {uz ? "Hozir kanalga chiqarish" : "Опубликовать сейчас"}
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
