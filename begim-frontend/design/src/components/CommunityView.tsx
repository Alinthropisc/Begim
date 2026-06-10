import { useState } from "react";
import { communityPosts } from "../data/products";
import CommunityPostCard from "./CommunityPost";

type Props = {
  onOpenApp: () => void;
};

export default function CommunityView({ onOpenApp }: Props) {
  const [posts, setPosts] = useState(communityPosts);
  const [filter, setFilter] = useState<"all" | "trending" | "following">("all");

  const toggleLike = (id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p))
    );
  };

  return (
    <div className="animate-fade-up space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="font-[Cormorant_Garamond] text-3xl md:text-4xl font-semibold text-[#8B2635]">
          Hamjamiyat
        </h1>
        <p className="text-sm text-[#8B7355] mt-1">
          Oshpazlar, retseptlar, hikoyalar — bir joyda ✨
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 bg-white rounded-full p-1 border border-[#C9A961]/20">
        {[
          { id: "all", label: "Hammasi" },
          { id: "trending", label: "🔥 Trendda" },
          { id: "following", label: "Obunalar" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id as any)}
            className={`flex-1 py-2 px-3 rounded-full text-sm font-medium transition ${
              filter === t.id
                ? "bg-[#8B2635] text-[#FBF5EC] shadow-md"
                : "text-[#2B1810] hover:bg-[#FBF5EC]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Create post CTA */}
      <button
        onClick={onOpenApp}
        className="w-full bg-white rounded-2xl border border-[#C9A961]/20 p-4 flex items-center gap-3 hover:border-[#C9A961] transition"
      >
        <div className="w-10 h-10 rounded-full bg-[#FBF5EC] flex items-center justify-center text-xl">
          👤
        </div>
        <div className="flex-1 text-left text-sm text-[#8B7355]">
          Nimadir ulashmoqchimisiz?
        </div>
        <div className="text-xs font-semibold text-[#8B2635] bg-[#FBF5EC] px-3 py-1.5 rounded-full">
          Post
        </div>
      </button>

      {/* Posts feed */}
      <div className="space-y-5">
        {posts.map((p) => (
          <CommunityPostCard
            key={p.id}
            post={p}
            onLike={toggleLike}
            onOpenApp={onOpenApp}
          />
        ))}
      </div>
    </div>
  );
}
