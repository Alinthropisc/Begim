export default function ProfileScreen() {
  return (
    <div className="absolute inset-0 bg-cream overflow-y-auto phone-scroll pt-8 pb-20">
      {/* Hero with pattern */}
      <div className="relative h-[200px] bg-gradient-to-br from-bordeaux to-bordeaux-dark pattern-bg">
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="starsP" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <polygon
                  points="25,5 35,15 35,25 25,35 15,25 15,15"
                  fill="none"
                  stroke="#C9A961"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#starsP)" />
          </svg>
        </div>
        <div className="relative h-full flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-cream border-[3px] border-gold flex items-center justify-center text-4xl">
            👤
          </div>
          <h2
            className="mt-3 text-2xl font-semibold text-cream"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Mehmon
          </h2>
          <p className="text-xs text-gold-light">+998 ** *** ** **</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-4 -mt-6 relative bg-white rounded-2xl border border-gold/20 p-4 flex">
        {[
          { count: "12", label: "Buyurtmalar" },
          { count: "8", label: "Sevimlilar" },
          { count: "3", label: "Sharhlar" },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className={`flex-1 text-center ${
              i < arr.length - 1 ? "border-r border-divider" : ""
            }`}
          >
            <p className="text-xl font-bold text-bordeaux">{s.count}</p>
            <p className="text-[11px] text-ink-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Menu */}
      <div className="mt-4 px-4 space-y-3">
        <h3 className="text-base font-semibold text-ink">Mening</h3>
        <div className="space-y-2">
          {[
            { icon: "📋", title: "Buyurtmalarim", sub: "Tarixni ko'rish" },
            { icon: "❤️", title: "Sevimlilar", sub: "8 ta mahsulot" },
            { icon: "📍", title: "Manzillarim", sub: "Yetkazib berish" },
          ].map((m) => (
            <button
              key={m.title}
              className="w-full bg-white rounded-xl border border-divider p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg">
                {m.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink">{m.title}</p>
                <p className="text-[11px] text-ink-muted">{m.sub}</p>
              </div>
              <span className="text-ink-light">›</span>
            </button>
          ))}
        </div>

        <h3 className="text-base font-semibold text-ink pt-2">Sozlamalar</h3>
        <div className="space-y-2">
          {[
            { icon: "🌐", title: "Til", sub: "O'zbek" },
            { icon: "🔔", title: "Bildirishnomalar", sub: "Yoqilgan" },
            { icon: "❓", title: "Yordam", sub: "FAQ" },
            { icon: "ℹ️", title: "Ilova haqida", sub: "v1.0.0" },
          ].map((m) => (
            <button
              key={m.title}
              className="w-full bg-white rounded-xl border border-divider p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center text-lg">
                {m.icon}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-ink">{m.title}</p>
                <p className="text-[11px] text-ink-muted">{m.sub}</p>
              </div>
              <span className="text-ink-light">›</span>
            </button>
          ))}
        </div>

        {/* Seller CTA */}
        <div className="mt-4 bg-bordeaux rounded-2xl p-4 flex items-center gap-3 text-cream">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center text-2xl">
            🏪
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Sotuvchi bo'lish</p>
            <p className="text-[11px] text-gold-light">Shirinliklaringizni soting</p>
          </div>
          <span>›</span>
        </div>
      </div>
    </div>
  );
}
