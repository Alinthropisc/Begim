import { useTelegram } from '../hooks/useTelegram';

export function ProfileScreen() {
  const tg = useTelegram();
  const user = tg.initDataUnsafe.user;

  return (
    <div className="p-4">
      <div className="bg-gradient-to-br from-[var(--color-bordeaux)] to-[var(--color-bordeaux-dark)] rounded-2xl p-6 text-white text-center pattern-bg relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto rounded-full bg-[var(--color-cream)] border-[3px] border-[var(--color-gold)] flex items-center justify-center text-4xl">
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              '👤'
            )}
          </div>
          <h2
            className="mt-3 text-2xl font-semibold"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {user?.first_name || 'Mehmon'}
          </h2>
          <p className="text-xs text-[var(--color-gold-light)] mt-1">
            @{user?.username || 'guest'}
          </p>
        </div>
      </div>

      <div className="mt-4 bg-white rounded-2xl border border-[var(--color-gold)]/20 p-4 flex">
        {[
          { count: '12', label: 'Buyurtmalar' },
          { count: '8', label: 'Sevimlilar' },
          { count: '3', label: 'Sharhlar' },
        ].map((s, i, arr) => (
          <div
            key={s.label}
            className={`flex-1 text-center ${i < arr.length - 1 ? 'border-r border-[var(--color-divider)]' : ''}`}
          >
            <p className="text-xl font-bold text-[var(--color-bordeaux)]">{s.count}</p>
            <p className="text-[11px] text-[var(--tg-theme-hint-color)] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {[
          { icon: '📋', title: 'Buyurtmalarim', sub: 'Tarixni ko\'rish' },
          { icon: '❤️', title: 'Sevimlilar', sub: '8 ta mahsulot' },
          { icon: '📍', title: 'Manzillarim', sub: 'Yetkazib berish' },
          { icon: '🌐', title: 'Til', sub: 'O\'zbek' },
          { icon: '🔔', title: 'Bildirishnomalar', sub: 'Yoqilgan' },
        ].map((m) => (
          <button
            key={m.title}
            className="w-full bg-white rounded-xl border border-[var(--color-divider)] p-3 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--color-cream-dark)] flex items-center justify-center text-lg">
              {m.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[var(--tg-theme-text-color)]">{m.title}</p>
              <p className="text-[11px] text-[var(--tg-theme-hint-color)]">{m.sub}</p>
            </div>
            <span className="text-[var(--color-ink-light)]">›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
