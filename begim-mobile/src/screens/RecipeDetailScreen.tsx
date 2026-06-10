import { useState } from "react";
import { products, formatPrice } from "../data/mockData";

interface Comment {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timeAgo: string;
  karma: number;
  reactions: Record<string, number>;
  parentId?: string;
}

const mockComments: Comment[] = [
  {
    id: "c1",
    authorName: "Mohira",
    authorAvatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
    content: "Shu retseptni bugun tayyorladim! Juda mazali chiqdi 😍 Rahmat!",
    timeAgo: "2 soat",
    karma: 3,
    reactions: { "❤️": 12, "🔥": 5 },
  },
  {
    id: "c2",
    authorName: "Nodira",
    authorAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    content: "Asal o'rniga shakar ishlatsa bo'ladimi? 🤔",
    timeAgo: "5 soat",
    karma: 1,
    reactions: { "🤔": 2 },
  },
  {
    id: "c2-1",
    authorName: "Dilnoza opa",
    authorAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    content: "Ha, ishlatsa bo'ladi, lekin ta'mi farq qiladi. Asal qo'shsangiz ayniqsa mazali! 🍯",
    timeAgo: "4 soat",
    karma: 5,
    reactions: { "❤️": 8, "👏": 3 },
    parentId: "c2",
  },
  {
    id: "c3",
    authorName: "Sevara",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    content: "Mening buvim ham shunday tayyorlardilar. Bolalikni eslatdi 🥺💕",
    timeAgo: "1 kun",
    karma: 8,
    reactions: { "❤️": 24, "😢": 3 },
  },
];

interface Props {
  onBack: () => void;
  onAddToCart?: (productId: string) => void;
}

export default function RecipeDetailScreen({ onBack, onAddToCart }: Props) {
  const product = products[0];
  const [isSaved, setIsSaved] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    "❤️": 42,
    "🔥": 18,
    "👏": 7,
    "⭐": 12,
  });
  const [comments, setComments] = useState(mockComments);
  const [newComment, setNewComment] = useState("");
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, boolean>>>({});

  const allReactions = ["❤️", "🔥", "👏", "⭐", "😂", "😮", "😢", "🎉"];

  const addReaction = (emoji: string) => {
    setReactions((prev) => ({
      ...prev,
      [emoji]: (prev[emoji] || 0) + 1,
    }));
    setShowReactions(false);
  };

  const addCommentReaction = (commentId: string, emoji: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, reactions: { ...c.reactions, [emoji]: (c.reactions[emoji] || 0) + 1 } }
          : c,
      ),
    );
    setCommentReactions((prev) => ({
      ...prev,
      [commentId]: { ...prev[commentId], [emoji]: true },
    }));
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    const newC: Comment = {
      id: `c${Date.now()}`,
      authorName: "Siz",
      authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
      content: newComment,
      timeAgo: "hozir",
      karma: 0,
      reactions: {},
    };
    setComments((prev) => [newC, ...prev]);
    setNewComment("");
  };

  const topComments = comments.filter((c) => !c.parentId);

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll">
      {/* Hero image */}
      <div className="relative h-[350px]">
        <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Top buttons */}
        <div className="absolute top-10 left-4 right-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-lg"
          >
            ←
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-lg"
            >
              {isSaved ? "🔖" : "📑"}
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-lg">
              ↗
            </button>
          </div>
        </div>

        {/* Type badge */}
        <div className="absolute top-24 left-4 px-3 py-1.5 rounded-xl bg-emerald text-white text-xs font-bold flex items-center gap-1">
          <span>🎓</span> Master-klass
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="inline-block px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-medium mb-2">
            🎂 Tortlar
          </div>
          <h1
            className="text-3xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {product.name}
          </h1>
        </div>
      </div>

      {/* Author card */}
      <div className="-mt-6 relative mx-4 bg-white rounded-2xl border border-gold/20 p-3 flex items-center gap-3">
        <div className="relative">
          <img
            src={product.sellerAvatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full bg-bordeaux border-2 border-white flex items-center justify-center">
            <span className="text-white text-[8px]">✓</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-ink">{product.sellerName}</p>
            <span className="px-1.5 py-0.5 rounded bg-emerald/10 text-emerald text-[9px] font-bold">
              🏆 Usta
            </span>
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            ⭐ Karma: 2 341 · 23 retsept
          </p>
        </div>
        <button className="px-3.5 py-1.5 bg-bordeaux text-cream rounded-full text-xs font-semibold">
          + Obuna
        </button>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 pb-28">
        {/* Meta */}
        <div className="bg-white rounded-2xl border border-gold/20 p-3 flex">
          {[
            { icon: "⏱️", label: "Vaqt", value: "120 min" },
            { icon: "📊", label: "Qiyinlik", value: "3/5" },
            { icon: "🍽️", label: "Portsiya", value: "8 kishi" },
          ].map((m, i, arr) => (
            <div
              key={m.label}
              className={`flex-1 text-center ${
                i < arr.length - 1 ? "border-r border-divider" : ""
              }`}
            >
              <div className="text-xl">{m.icon}</div>
              <p className="text-[11px] text-ink-muted mt-1">{m.label}</p>
              <p className="text-xs font-bold text-ink mt-0.5">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Description */}
        <h3
          className="mt-5 text-xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tavsif
        </h3>
        <p className="mt-2 text-sm text-ink leading-relaxed">
          {product.description}
        </p>

        {/* Ingredients */}
        <h3
          className="mt-5 text-xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Kerakli masalliqlar
        </h3>
        <div className="mt-3 bg-white rounded-2xl border border-gold/20 p-4">
          {[
            "Un — 500g",
            "Asal — 3 osh qoshiq",
            "Tuxum — 3 dona",
            "Shakar — 200g",
            "Sariyog' — 200g",
            "Soda — 1 choy qoshiq",
          ].map((ing, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <div className="w-6 h-6 rounded-md bg-cream flex items-center justify-center text-[11px] font-bold text-bordeaux">
                {i + 1}
              </div>
              <p className="flex-1 text-sm text-ink">{ing}</p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <h3
          className="mt-5 text-xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Tayyorlash bosqichlari
        </h3>
        <div className="mt-3 space-y-3">
          {[
            "Asal va shakarni suv hammomida eritib oling",
            "Tuxum va sodani qo'shib aralashtiring",
            "Unni asta-sekin qo'shib xamir qoring",
            "Xamirni 8 qismga bo'ling va yupqa qilib yoying",
            "Har bir qatlamni 180°C da 5-7 daqiqa pishiring",
            "Qaymoqli krem tayyorlang",
            "Qatlamlarni krem bilan surting",
            "6 soat sovutgichda tursin",
          ].map((step, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gold/20 p-3 flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-bordeaux text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <p className="flex-1 text-sm text-ink leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Reactions (Telegram-style) */}
        <div className="mt-5">
          <div className="flex flex-wrap gap-2">
            {Object.entries(reactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => addReaction(emoji)}
                className="px-3 py-1.5 rounded-full bg-bordeaux/10 border border-bordeaux/30 flex items-center gap-1.5 hover:bg-bordeaux/20 transition-colors"
              >
                <span className="text-lg">{emoji}</span>
                <span className="text-xs font-semibold text-bordeaux">{count}</span>
              </button>
            ))}
            {/* Add reaction button */}
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="px-3 py-1.5 rounded-full bg-cream border border-divider flex items-center gap-1"
            >
              <span className="text-base">😊</span>
              <span className="text-base text-ink-muted">+</span>
            </button>
          </div>

          {/* Emoji picker */}
          {showReactions && (
            <div className="mt-3 bg-white rounded-2xl border border-divider p-3 shadow-lg">
              <div className="flex flex-wrap gap-2">
                {allReactions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(emoji)}
                    className="w-11 h-11 rounded-xl bg-cream hover:bg-cream-dark flex items-center justify-center text-2xl transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Comments */}
        <h3
          className="mt-6 text-xl font-semibold text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Sharhlar ({comments.length})
        </h3>

        {/* Add comment input */}
        <div className="mt-3 bg-white rounded-2xl border border-gold/20 p-3 flex gap-2 items-end">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=me"
            alt=""
            className="w-9 h-9 rounded-full"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Sharh yozish..."
              rows={2}
              className="w-full text-sm text-ink placeholder:text-ink-light bg-transparent outline-none resize-none"
            />
          </div>
          {newComment.trim() && (
            <button
              onClick={submitComment}
              className="w-9 h-9 rounded-full bg-bordeaux text-white flex items-center justify-center text-lg"
            >
              ↑
            </button>
          )}
        </div>

        {/* Comments list */}
        <div className="mt-4 space-y-3">
          {topComments.map((comment) => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                reactions={commentReactions[comment.id] || {}}
                onReact={(emoji) => addCommentReaction(comment.id, emoji)}
              />
              {/* Replies */}
              {comments
                .filter((c) => c.parentId === comment.id)
                .map((reply) => (
                  <div key={reply.id} className="ml-8 mt-2">
                    <CommentItem
                      comment={reply}
                      reactions={commentReactions[reply.id] || {}}
                      onReact={(emoji) => addCommentReaction(reply.id, emoji)}
                      isReply
                    />
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[380px] bg-white border-t border-divider px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[11px] text-ink-muted">Narxi</p>
            <p className="text-lg font-bold text-bordeaux">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={() => onAddToCart?.(product.id)}
            className="flex-1 bg-bordeaux text-cream font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-bordeaux/30"
          >
            <span>🛒</span> Savatga qo'shish
          </button>
          {/* Boost button */}
          <button className="px-4 py-3 rounded-xl bg-gradient-to-br from-gold to-gold-light text-white font-bold text-sm shadow-lg shadow-gold/30">
            🚀
          </button>
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  reactions,
  onReact,
  isReply = false,
}: {
  comment: Comment;
  reactions: Record<string, boolean>;
  onReact: (emoji: string) => void;
  isReply?: boolean;
}) {
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl p-3 ${
        isReply ? "border-l-2 border-gold/30" : "border border-gold/20"
      }`}
    >
      <div className="flex gap-2.5">
        <img
          src={comment.authorAvatar}
          alt=""
          className="w-9 h-9 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-ink">{comment.authorName}</p>
            {comment.karma > 2 && (
              <span className="px-1.5 py-0.5 rounded bg-gold/20 text-gold-dark text-[9px] font-bold">
                +{comment.karma}
              </span>
            )}
            <span className="text-[11px] text-ink-muted ml-auto">
              {comment.timeAgo}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink leading-relaxed">
            {comment.content}
          </p>

          {/* Reactions */}
          {Object.keys(comment.reactions).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(comment.reactions).map(([emoji, count]) => (
                <button
                  key={emoji}
                  onClick={() => onReact(emoji)}
                  className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 transition-colors ${
                    reactions[emoji]
                      ? "bg-bordeaux/20 border border-bordeaux/40"
                      : "bg-cream"
                  }`}
                >
                  <span>{emoji}</span>
                  <span className="font-semibold text-ink">
                    {count + (reactions[emoji] ? 1 : 0)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setShowQuickReactions(!showQuickReactions)}
              className="text-[11px] text-ink-muted hover:text-bordeaux"
            >
              😊 Reaksiya
            </button>
            <button className="text-[11px] text-ink-muted hover:text-bordeaux">
              💬 Javob
            </button>
          </div>

          {/* Quick reaction picker */}
          {showQuickReactions && (
            <div className="mt-2 flex gap-1 bg-cream rounded-full p-1 w-fit">
              {["❤️", "🔥", "👏", "😂", "😮", "😢"].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowQuickReactions(false);
                  }}
                  className="w-7 h-7 rounded-full hover:bg-white flex items-center justify-center text-base transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
