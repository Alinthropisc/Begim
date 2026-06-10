import { useState } from "react";

interface Post {
  id: string;
  type: "post" | "tutorial" | "challenge";
  title: string;
  description: string;
  author: {
    name: string;
    avatar: string;
    karma: number;
    level: string;
    levelIcon: string;
    verified: boolean;
  };
  image: string;
  hub: { name: string; icon: string };
  tags: string[];
  cookingTime: number;
  karmaVotes: number;
  commentsCount: number;
  viewsCount: number;
  timeAgo: string;
}

const hubs = [
  { id: "all", name: "Barchasi", icon: "🌟", count: 1240, subscribed: false },
  { id: "tortlar", name: "Tortlar", icon: "🎂", count: 234, subscribed: true },
  { id: "milliy", name: "Milliy", icon: "🕌", count: 456, subscribed: true },
  { id: "challenge", name: "Challenges", icon: "🏆", count: 45, subscribed: false },
  { id: "master", name: "Master-klass", icon: "🎓", count: 89, subscribed: false },
];

const posts: Post[] = [
  {
    id: "1",
    type: "challenge",
    title: "🔥 CHALLENGE: Eng yaxshi paxlava!",
    description:
      "Bu hafta biz eng yaxshi paxlava retseptini aniqlaymiz! O'z retseptingizni ulashing va 100 000 so'm yutuqni qo'lga kiriting!",
    author: {
      name: "Begim Jamoa",
      avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=begim",
      karma: 9999,
      level: "Admin",
      levelIcon: "👑",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
    hub: { name: "Challenges", icon: "🏆" },
    tags: ["challenge", "paxlava"],
    cookingTime: 180,
    karmaVotes: 1203,
    commentsCount: 234,
    viewsCount: 3609,
    timeAgo: "2 soat oldin",
  },
  {
    id: "2",
    type: "tutorial",
    title: "Medovik — klassik retsept",
    description:
      "Klassik medovik retsepti — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem. Buvimdan qolgan retsept.",
    author: {
      name: "Dilnoza opa",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
      karma: 2341,
      level: "Usta",
      levelIcon: "🏆",
      verified: true,
    },
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    hub: { name: "Tortlar", icon: "🎂" },
    tags: ["tort", "medovik", "klassik"],
    cookingTime: 120,
    karmaVotes: 342,
    commentsCount: 67,
    viewsCount: 1026,
    timeAgo: "5 soat oldin",
  },
  {
    id: "3",
    type: "post",
    title: "Chak-chak: milliy shirinlik",
    description:
      "Chak-chak — bu nafaqat shirinlik, balki mehr va mehr ramzi. Har bir bo'lagida ota-bobolarimiz an'analari mujassam.",
    author: {
      name: "Gulnora xola",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
      karma: 892,
      level: "Professional",
      levelIcon: "👨‍🍳",
      verified: false,
    },
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    hub: { name: "Milliy", icon: "🕌" },
    tags: ["milliy", "chak-chak"],
    cookingTime: 90,
    karmaVotes: 521,
    commentsCount: 89,
    viewsCount: 1563,
    timeAgo: "1 kun oldin",
  },
];

interface Props {
  onRecipeClick?: () => void;
}

export default function CommunityScreen({ onRecipeClick }: Props) {
  const [activeTab, setActiveTab] = useState(0);
  const [voted, setVoted] = useState<Record<string, "up" | "down" | null>>({});
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [userKarma] = useState(342);

  const vote = (postId: string, dir: "up" | "down") => {
    setVoted((prev) => ({
      ...prev,
      [postId]: prev[postId] === dir ? null : dir,
    }));
  };

  const toggleSave = (postId: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll pt-8 pb-20">
      {/* Header */}
      <div className="px-4 pt-4 flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-semibold text-ink"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Jamoa
          </h1>
          <p className="text-xs text-ink-muted mt-0.5">
            Retseptlar, ilhom va do'stlik
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-gradient-to-br from-gold to-gold-light shadow-md shadow-gold/30 flex items-center gap-1.5">
            <span className="text-xs">⭐</span>
            <span className="text-xs font-bold text-white">{userKarma}</span>
          </div>
          <button className="px-3.5 py-2 bg-bordeaux text-cream rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md shadow-bordeaux/30">
            <span>+</span> Post
          </button>
        </div>
      </div>

      {/* Hubs */}
      <div className="mt-4 flex gap-2.5 overflow-x-auto phone-scroll px-4 pb-2">
        {hubs.map((hub) => (
          <div
            key={hub.id}
            className={`flex-shrink-0 w-[96px] p-3 rounded-2xl bg-white text-center border-2 transition-all ${
              hub.subscribed
                ? "border-bordeaux shadow-md shadow-bordeaux/20"
                : "border-divider"
            }`}
          >
            <div className="text-2xl">{hub.icon}</div>
            <p
              className={`mt-1.5 text-[11px] font-semibold ${
                hub.subscribed ? "text-bordeaux" : "text-ink"
              }`}
            >
              {hub.name}
            </p>
            <p className="text-[10px] text-ink-muted">{hub.count}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-3 px-4 flex gap-1 border-b border-divider overflow-x-auto phone-scroll">
        {["🔥 Trend", "✨ Yangi", "🎓 Master-klass", "🏆 Challenges"].map(
          (tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-shrink-0 px-3 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === i
                  ? "text-bordeaux border-bordeaux"
                  : "text-ink-muted border-transparent"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      {/* Posts */}
      <div className="mt-3 px-4 space-y-3">
        {posts.map((post) => {
          const voteState = voted[post.id];
          const karmaCount =
            post.karmaVotes +
            (voteState === "up" ? 1 : voteState === "down" ? -1 : 0);
          const isSaved = saved.has(post.id);

          return (
            <div
              key={post.id}
              className="bg-white rounded-2xl overflow-hidden border border-gold/20 shadow-sm"
            >
              {/* Image */}
              {post.image && (
                <button onClick={onRecipeClick} className="w-full relative block">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                  <div
                    className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 shadow-md ${
                      post.type === "challenge"
                        ? "bg-bordeaux"
                        : post.type === "tutorial"
                        ? "bg-emerald"
                        : "bg-gold"
                    }`}
                  >
                    <span>
                      {post.type === "challenge"
                        ? "🏆"
                        : post.type === "tutorial"
                        ? "🎓"
                        : "📖"}
                    </span>
                    {post.type === "challenge"
                      ? "Challenge"
                      : post.type === "tutorial"
                      ? "Master-klass"
                      : "Retsept"}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/60 text-white text-[11px] flex items-center gap-1">
                    <span>⏱️</span> {post.cookingTime} min
                  </div>

                  {/* Challenge banner */}
                  {post.type === "challenge" && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bordeaux/90 to-transparent p-3">
                      <div className="bg-gold rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5">
                        <span>💰</span>
                        <span className="text-xs font-bold text-white">100 000 so'm</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-bordeaux bg-cream"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-cream font-medium">+234</span>
                      </div>
                    </div>
                  )}
                </button>
              )}

              {/* Content */}
              <div className="p-4">
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <img
                      src={post.author.avatar}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover"
                    />
                    {post.author.verified && (
                      <div className="absolute -right-0.5 -bottom-0.5 w-4 h-4 rounded-full bg-bordeaux border-2 border-white flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-semibold text-ink truncate">
                        {post.author.name}
                      </p>
                      <span className="px-1.5 py-0.5 rounded bg-emerald/10 text-emerald text-[9px] font-bold flex items-center gap-0.5">
                        {post.author.levelIcon} {post.author.level}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted">
                      {post.timeAgo} · ⭐ {post.author.karma}
                    </p>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-cream text-[10px] font-semibold text-bordeaux flex items-center gap-1">
                    <span>{post.hub.icon}</span>
                    <span>{post.hub.name}</span>
                  </div>
                </div>

                {/* Title */}
                <button onClick={onRecipeClick} className="w-full text-left">
                  <h3
                    className="mt-3 text-lg font-semibold text-ink leading-tight hover:text-bordeaux transition-colors"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {post.title}
                  </h3>
                </button>

                {/* Description */}
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed line-clamp-2">
                  {post.description}
                </p>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-cream border border-divider text-[11px] text-bordeaux font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-3">
                  {/* Karma vote */}
                  <div
                    className={`flex items-center rounded-full border ${
                      voteState
                        ? "bg-bordeaux/10 border-bordeaux"
                        : "bg-cream border-divider"
                    }`}
                  >
                    <button
                      onClick={() => vote(post.id, "up")}
                      className={`w-7 h-7 flex items-center justify-center ${
                        voteState === "up" ? "text-bordeaux" : "text-ink-muted"
                      }`}
                    >
                      ↑
                    </button>
                    <span
                      className={`text-xs font-bold px-1 ${
                        voteState === "up"
                          ? "text-bordeaux"
                          : voteState === "down"
                          ? "text-red-600"
                          : "text-ink"
                      }`}
                    >
                      {karmaCount}
                    </span>
                    <button
                      onClick={() => vote(post.id, "down")}
                      className={`w-7 h-7 flex items-center justify-center ${
                        voteState === "down" ? "text-red-600" : "text-ink-muted"
                      }`}
                    >
                      ↓
                    </button>
                  </div>

                  <button className="flex items-center gap-1 text-xs text-ink-muted">
                    <span>💬</span>
                    <span>{post.commentsCount}</span>
                  </button>

                  <button className="flex items-center gap-1 text-xs text-ink-muted">
                    <span>👁️</span>
                    <span>{post.viewsCount}</span>
                  </button>

                  <div className="flex-1" />

                  <button
                    onClick={() => toggleSave(post.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isSaved ? "text-bordeaux" : "text-ink-muted"
                    }`}
                  >
                    {isSaved ? "🔖" : "📑"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Daily Menu Promo */}
        <div className="bg-gradient-to-br from-emerald to-emerald-light rounded-2xl p-4 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="starsDaily" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <polygon points="25,5 35,15 35,25 25,35 15,25 15,15" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#starsDaily)" />
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📅</span>
              <span className="text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
                BUGUNGI MENYU
              </span>
            </div>
            <h3 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
              Nonushta uchun maxsus
            </h3>
            <p className="text-xs mt-1 opacity-90">
              15% chegirma · 3 ta sotuvchi · Yetkazish 2 soat
            </p>
            <button className="mt-3 bg-white text-emerald px-4 py-2 rounded-full text-xs font-bold">
              Ko'rish →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
