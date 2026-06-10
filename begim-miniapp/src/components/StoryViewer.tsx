import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Heart, Send, ShoppingBag } from "lucide-react";
import { type Story } from "../data/products";

type Props = {
  stories: Story[];
  startIndex: number;
  onClose: () => void;
  onProductClick?: (productId: string) => void;
};

export default function StoryViewer({ stories, startIndex, onClose, onProductClick }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reply, setReply] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const current = stories[index];

  useEffect(() => { setProgress(0); }, [index]);

  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (index < stories.length - 1) { setIndex(i => i + 1); return 0; }
          else { onClose(); return 100; }
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [index, paused, stories.length, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const next = () => { if (index < stories.length - 1) { setIndex(index + 1); setProgress(0); } else onClose(); };
  const prev = () => { if (index > 0) { setIndex(index - 1); setProgress(0); } };

  const handleSend = () => {
    if (!reply.trim()) return;
    setSent(true); setReply("");
    setTimeout(() => { setSent(false); setPaused(false); }, 2000);
  };

  const handleBuy = () => {
    if (current.productLink) onProductClick?.(current.productLink);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-fade-up">
      <div className="relative w-full max-w-md h-full md:h-[90vh] md:max-h-[90vh] md:rounded-2xl overflow-hidden bg-[#2B1810] flex flex-col">

        {/* Progress bars */}
        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 p-2 pt-safe">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-100"
                style={{ width: i < index ? "100%" : i === index ? `${progress}%` : "0%" }} />
            </div>
          ))}
        </div>

        {/* Top bar */}
        <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-between px-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">{current.sellerAvatar}</div>
            <div>
              <div className="text-white text-sm font-semibold">{current.seller}</div>
              <div className="text-white/70 text-[10px]">{current.createdAt}</div>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 relative">
          <img src={current.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
          {current.text && (
            <div className="absolute bottom-6 inset-x-0 text-center px-6">
              <p className="text-white text-lg font-medium drop-shadow-lg">{current.text}</p>
            </div>
          )}
          {/* Tap zones */}
          <button type="button" onClick={prev} className="absolute left-0 top-0 w-1/3 h-full" aria-label="Oldingi" />
          <button type="button" onClick={next} className="absolute right-0 top-0 w-1/3 h-full" aria-label="Keyingi" />
          {index > 0 && (
            <button type="button" onClick={prev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center text-white hover:bg-black/70 transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {index < stories.length - 1 && (
            <button type="button" onClick={next}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center text-white hover:bg-black/70 transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom bar — z-30 so it's above tap zones */}
        <div className="relative z-30 flex items-center gap-2 p-3 pb-safe bg-black/60"
          onPointerDown={e => e.stopPropagation()}>

          {sent ? (
            <div className="flex-1 text-center text-white/80 text-sm py-2.5 font-medium">✓ Yuborildi</div>
          ) : (
            <div className="flex-1 flex items-center bg-white/10 backdrop-blur rounded-full px-3 border border-white/20">
              <input
                ref={inputRef}
                value={reply}
                onChange={e => setReply(e.target.value)}
                onFocus={() => setPaused(true)}
                onBlur={() => { if (!reply.trim()) setPaused(false); }}
                onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
                placeholder="Javob yozing..."
                className="flex-1 bg-transparent text-white placeholder-white/50 text-sm py-2.5 focus:outline-none min-w-0"
              />
              {reply.trim() && (
                <button type="button" onClick={handleSend} className="flex-shrink-0 pl-2 text-[#C9A961]">
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button type="button"
            onClick={() => setLiked(s => { const n = new Set(s); n.has(index) ? n.delete(index) : n.add(index); return n; })}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition flex-shrink-0 ${liked.has(index) ? "bg-red-500/80" : "bg-white/10 hover:bg-white/20"}`}>
            <Heart className={`w-5 h-5 text-white ${liked.has(index) ? "fill-white" : ""}`} />
          </button>

          {current.productLink && (
            <button type="button" onClick={handleBuy}
              className="btn-gold px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
              <ShoppingBag className="w-3.5 h-3.5" /> Xarid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
