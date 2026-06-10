import { useState } from "react";

const ADMIN_PASSWORD = "begim2026";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (pw === ADMIN_PASSWORD) {
        localStorage.setItem("bgm_admin_auth", "1");
        onLogin();
      } else {
        setError(true);
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#2B1810] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-[Cormorant_Garamond] text-5xl font-semibold text-[#C9A961] mb-1">Begim</div>
          <div className="text-[#C9A961]/60 text-sm uppercase tracking-widest">Admin Panel</div>
        </div>
        <form onSubmit={submit} className="bg-white/5 border border-[#C9A961]/20 rounded-3xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-[#C9A961]/70 font-medium mb-2">Parol / Пароль</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setError(false); }}
              placeholder="••••••••"
              className={`w-full bg-white/10 border ${error ? "border-red-500" : "border-[#C9A961]/30"} rounded-xl px-4 py-3 text-[#F3E8D4] placeholder-[#C9A961]/30 focus:outline-none focus:border-[#C9A961] transition text-sm`}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs mt-1.5">Noto'g'ri parol / Неверный пароль</p>}
          </div>
          <button
            type="submit"
            disabled={!pw || loading}
            className="w-full bg-[#8B2635] disabled:opacity-50 text-white rounded-2xl py-3 font-semibold text-sm transition hover:bg-[#6B1A27]"
          >
            {loading ? "..." : "Kirish / Войти"}
          </button>
        </form>
        <p className="text-center text-[#C9A961]/30 text-xs mt-6">Begim Marketplace © 2026</p>
      </div>
    </div>
  );
}
