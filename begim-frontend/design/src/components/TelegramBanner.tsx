import { QRCodeSVG } from "qrcode.react";
import { X, Send, Smartphone, Sparkles, Shield, Zap, Share2 } from "lucide-react";
import { BOT_CONFIG } from "../config";

type Props = {
  onClose: () => void;
  action?: "buy" | "review" | "register" | "community";
};

const actionText: Record<string, { title: string; sub: string; emoji: string }> = {
  buy: {
    title: "Buyurtma berish — Telegram'da",
    sub: "Sotuvchi bilan to'g'ridan-to'g'ri bog'laning va buyurtmani Mini App orqali rasmiylashtiring",
    emoji: "🛍️",
  },
  review: {
    title: "Sharh qoldirish — Telegram'da",
    sub: "O'z fikringizni yozing va boshqalar bilan o'rtoqlashing",
    emoji: "⭐",
  },
  register: {
    title: "Ro'yxatdan o'tish — Telegram'da",
    sub: "Bir bosishda, telefon raqamisiz. Telegram akkauntingiz bilan avtomatik kirish",
    emoji: "👋",
  },
  community: {
    title: "Hamjamiyatga qo'shiling",
    sub: "Pazandalar bilan muloqot, retseptlar, yangi do'stlar — barchasi Mini App'da",
    emoji: "💬",
  },
};

export default function TelegramBanner({ onClose, action = "register" }: Props) {
  const text = actionText[action];

  const openBot = () => {
    window.open(BOT_CONFIG.startLink, "_blank");
  };

  const shareApp = () => {
    window.open(BOT_CONFIG.shareLink, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center justify-center bg-[#2B1810]/70 backdrop-blur-sm animate-fade-up" onClick={onClose}>
      <div
        className="relative bg-[#FBF5EC] w-full md:max-w-md md:rounded-3xl rounded-t-3xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow-md">
          <X className="w-5 h-5" />
        </button>

        {/* Header with pattern */}
        <div className="relative begim-pattern-dark p-6 pt-8 text-[#FBF5EC] text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A961]/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#FBF5EC] shadow-2xl mb-4">
              <Send className="w-10 h-10 text-[#229ED9]" />
            </div>
            <div className="text-5xl mb-2">{text.emoji}</div>
            <h2 className="font-[Cormorant_Garamond] text-2xl font-semibold mb-1">{text.title}</h2>
            <p className="text-sm text-[#F3E8D4]/80">{text.sub}</p>
          </div>
        </div>

        {/* QR + Info */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="bg-white rounded-2xl border border-[#C9A961]/20 p-5 flex flex-col items-center">
            <p className="text-xs text-[#8B7355] mb-3">Telefon bilan skanerlang</p>
            <div className="bg-white p-3 rounded-2xl border-2 border-[#8B2635]/10">
              <QRCodeSVG
                value={BOT_CONFIG.miniAppLink}
                size={160}
                fgColor="#2B1810"
                bgColor="#FFFFFF"
                level="M"
              />
            </div>
            <p className="text-xs text-[#8B7355] mt-3 text-center">
              Yoki <b className="text-[#8B2635]">{BOT_CONFIG.botLink}</b> bosing
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Zap, title: "Tez", desc: "Bir bosishda kirish" },
              { icon: Shield, title: "Xavfsiz", desc: "Telegram himoyasi" },
              { icon: Sparkles, title: "Bepul", desc: "Hech qanday to'lov" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="bg-white rounded-2xl border border-[#C9A961]/20 p-3 text-center">
                  <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4 text-[#8B2635]" />
                  </div>
                  <div className="text-xs font-semibold text-[#2B1810]">{f.title}</div>
                  <div className="text-[10px] text-[#8B7355] mt-0.5">{f.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Device hint */}
          <div className="flex items-start gap-2 text-xs text-[#8B7355] bg-[#FBF5EC] rounded-2xl p-3 border border-[#C9A961]/20">
            <Smartphone className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#8B2635]" />
            <p>
              <b className="text-[#2B1810]">Kompyuterda ko'ryapsizmi?</b> QR kodni telefoningizdagi Telegram ilovasi orqali skanerlang — Mini App avtomatik ochiladi.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-[#C9A961]/20 p-4 pb-safe bg-white/50 space-y-2">
          <button
            onClick={openBot}
            className="w-full py-3.5 rounded-full font-semibold flex items-center justify-center gap-2 text-white shadow-lg transition hover:shadow-xl hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #229ED9 0%, #1a7fb0 100%)" }}
          >
            <Send className="w-4 h-4" /> Telegram'da ochish
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareApp}
              className="py-2.5 rounded-full text-sm font-medium border border-[#C9A961]/30 bg-white hover:bg-[#FBF5EC] transition flex items-center justify-center gap-1.5 text-[#2B1810]"
            >
              <Share2 className="w-3.5 h-3.5" /> Do'stlarga
            </button>
            <button
              onClick={onClose}
              className="py-2.5 rounded-full text-sm text-[#8B7355] hover:text-[#2B1810]"
            >
              Hozir emas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
