import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { type CommunityPost } from "../data/products";

type Props = {
  post: CommunityPost;
  onLike: (id: string) => void;
  onOpenApp?: () => void;
};

export default function CommunityPostCard({ post, onLike, onOpenApp }: Props) {
  return (
    <article className="bg-white rounded-3xl border border-[#C9A961]/20 overflow-hidden shadow-sm hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#C9A961] via-[#8B2635] to-[#E4CE8A]">
            <div className="w-11 h-11 rounded-full bg-[#FBF5EC] flex items-center justify-center text-xl">
              {post.sellerAvatar}
            </div>
          </div>
          <div>
            <div className="font-semibold text-sm text-[#2B1810] flex items-center gap-1">
              {post.seller}
              <span className="w-1 h-1 bg-[#C9A961] rounded-full" />
              <span className="text-xs font-normal text-[#8B7355]">{post.sellerCity}</span>
            </div>
            <div className="text-[11px] text-[#8B7355]">{post.createdAt}</div>
          </div>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-[#FBF5EC] flex items-center justify-center">
          <MoreHorizontal className="w-4 h-4 text-[#8B7355]" />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3E8D4]">
        <img src={post.image} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 px-4 pt-3">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-[#FBF5EC] transition"
        >
          <Heart className={`w-5 h-5 ${post.liked ? "fill-[#8B2635] text-[#8B2635]" : "text-[#2B1810]"}`} />
          <span className="text-sm font-semibold">{post.likes + (post.liked ? 1 : 0)}</span>
        </button>
        <button
          onClick={onOpenApp}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-full hover:bg-[#FBF5EC] transition"
        >
          <MessageCircle className="w-5 h-5 text-[#2B1810]" />
          <span className="text-sm font-semibold">{post.comments}</span>
        </button>
        <button
          onClick={onOpenApp}
          className="p-1.5 rounded-full hover:bg-[#FBF5EC] transition"
        >
          <Send className="w-5 h-5 text-[#2B1810]" />
        </button>
        <div className="flex-1" />
        <button className="p-1.5 rounded-full hover:bg-[#FBF5EC] transition">
          <Bookmark className="w-5 h-5 text-[#2B1810]" />
        </button>
      </div>

      {/* Caption */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-sm text-[#2B1810] leading-relaxed">
          <span className="font-semibold">{post.seller.split(" ")[0]}</span>{" "}
          {post.text}
        </p>
        {post.tags && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((t) => (
              <span key={t} className="text-xs text-[#8B2635] font-medium">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
