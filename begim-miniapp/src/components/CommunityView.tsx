import { useState } from "react";
import { Star, Heart, Camera, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useT, type Lang } from "../i18n";

type Props = {
  onOpenApp: () => void;
  lang: Lang;
};

const REVIEWS = [
  {
    id: "rev1", user: "Malika T.", avatar: "👩",
    product: "Napoleon torti", productEmoji: "🎂", seller: "Dilnoza Yusupova",
    rating: 5,
    text: "Juda mazali! Oilam hammasi yedi, lekin menga ham ozgina tegdi 😄 Albatta qaytib buyurtma beraman.",
    textRu: "Очень вкусно! Вся семья съела, мне досталось совсем чуть-чуть 😄 Обязательно закажу ещё.",
    photos: [
      { bg: "from-[#8B2635] to-[#C9A961]", emoji: "🎂" },
      { bg: "from-[#C9A961] to-[#E4CE8A]", emoji: "✨" },
    ],
    likes: 34, time: "2 soat oldin", timeRu: "2 часа назад",
  },
  {
    id: "rev2", user: "Sardor M.", avatar: "👨",
    product: "Samarqand noni", productEmoji: "🫓", seller: "Feruza Ergasheva",
    rating: 5,
    text: "Issiq-issiq edi, hididan o'ziyoq bilsa bo'ladi — haqiqiy tandir noni. Ertaga yana olib aman.",
    textRu: "Пришёл горячим, запах — как из настоящего тандыра. Завтра снова закажу.",
    photos: [
      { bg: "from-[#8B4513] to-[#D2691E]", emoji: "🫓" },
    ],
    likes: 21, time: "5 soat oldin", timeRu: "5 часов назад",
  },
  {
    id: "rev3", user: "Nargiza X.", avatar: "👩‍🦱",
    product: "Somsa", productEmoji: "🥐", seller: "Mohira Alimova",
    rating: 4,
    text: "Go'shti ko'p, yog'i kam — aynan shunday yoqadi. Keyingisi uchun biroz ko'proq murch so'radim.",
    textRu: "Много мяса, мало жира — именно то, что нравится. Попросила чуть больше перца в следующий раз.",
    photos: [],
    likes: 18, time: "1 kun oldin", timeRu: "1 день назад",
  },
  {
    id: "rev4", user: "Dilrabo K.", avatar: "👩‍🦰",
    product: "Gaz-payvand pechene", productEmoji: "🍪", seller: "Zulfiya Xasanova",
    rating: 5,
    text: "To'y dasturxoniga oldim — mehmonlar maqtadi! Qadoqlash ham chiroyli, sovg'a qilsa bo'lar ekan.",
    textRu: "Брала на свадебный стол — гости хвалили! Упаковка красивая, можно дарить.",
    photos: [
      { bg: "from-[#6B3F1A] to-[#C9A961]", emoji: "🍪" },
      { bg: "from-[#C9A961] to-[#8B2635]", emoji: "🎁" },
      { bg: "from-[#2D5F4E] to-[#C9A961]", emoji: "✨" },
    ],
    likes: 52, time: "2 kun oldin", timeRu: "2 дня назад",
  },
];

function PhotoSlider({ photos }: { photos: { bg: string; emoji: string }[] }) {
  const [idx, setIdx] = useState(0);
  if (!photos.length) return null;
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
      <div className={`w-full h-full bg-gradient-to-br ${photos[idx].bg} flex items-center justify-center text-6xl`}>
        {photos[idx].emoji}
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-1.5 h-1.5 rounded-full transition ${i === idx ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function CommunityView({ onOpenApp, lang }: Props) {
  const tr = useT(lang);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const toggle = (id: string) => setLiked((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="animate-fade-up space-y-4 max-w-2xl mx-auto">
      <div className="flex items-baseline justify-between">
        <h1 className="font-[Cormorant_Garamond] text-3xl font-semibold text-[#8B2635]">{tr.community_title}</h1>
        <button
          onClick={onOpenApp}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8B2635] border border-[#8B2635]/30 px-3 py-1 rounded-full hover:bg-[#8B2635]/5"
        >
          <Camera className="w-3 h-3" /> {tr.community_add}
        </button>
      </div>

      <button
        onClick={onOpenApp}
        className="w-full bg-white rounded-2xl border border-[#C9A961]/20 p-3.5 flex items-center gap-3 hover:border-[#C9A961] transition"
      >
        <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">👤</div>
        <span className="flex-1 text-left text-sm text-[#8B7355]">{tr.community_write}</span>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map((s) => <Star key={s} className="w-3.5 h-3.5 text-[#C9A961]/40" />)}
        </div>
      </button>

      <div className="space-y-3">
        {REVIEWS.map((r) => {
          const isLiked = liked.has(r.id);
          const text = lang === "uz" ? r.text : r.textRu;
          const time = lang === "uz" ? r.time : r.timeRu;
          return (
            <div key={r.id} className="bg-white rounded-2xl border border-[#C9A961]/15 shadow-sm overflow-hidden">
              {/* Photos */}
              {r.photos.length > 0 && (
                <PhotoSlider photos={r.photos} />
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg flex-shrink-0">
                    {r.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#2B1810]">{r.user}</span>
                      <span className="text-[10px] text-[#8B7355]">{time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#8B7355] mt-0.5">
                      <span>{r.productEmoji}</span>
                      <span>{r.product}</span>
                      <span className="text-[#C9A961]/60">·</span>
                      <span>{r.seller}</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "fill-[#C9A961] text-[#C9A961]" : "text-[#C9A961]/30"}`} />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-[#2B1810] leading-relaxed">{text}</p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggle(r.id)}
                    className={`flex items-center gap-1.5 text-xs transition ${isLiked ? "text-[#8B2635]" : "text-[#8B7355] hover:text-[#8B2635]"}`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-[#8B2635]" : ""}`} />
                    {r.likes + (isLiked ? 1 : 0)} {tr.community_useful}
                  </button>
                  <button
                    onClick={onOpenApp}
                    className="flex items-center gap-1.5 text-xs text-[#8B7355] hover:text-[#8B2635] transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    {lang === "uz" ? "Izoh" : "Комментарий"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
