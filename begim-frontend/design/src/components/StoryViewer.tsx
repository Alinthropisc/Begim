import { useEffect, useState } from "react";
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
  const current = stories[index];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (index < stories.length - 1) {
            setIndex((i) => i + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        return p + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [index, stories.length, onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const next = () => {
    if (index < stories.length - 1) { setIndex(index + 1); setProgress(0); }
    else onClose();
  };
  const prev = () => {
    if (index > 0) { setIndex(index - 1); setProgress(0); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center animate-fade-up">
      <div className="relative w-full max-w-md h-full md:h-[90vh] md:max-h-[90vh] md:rounded-2xl overflow-hidden bg-[#2B1810] flex flex-col">
        {/* Progress bars */}
        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 p-2 pt-safe">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: i < index ? "100%" : i === index ? `${progress}%` : "0%"
                }}
              />
            </div>
          ))}
        </div>

        {/* Top bar */}
        <div className="absolute top-3 inset-x-0 z-20 flex items-center justify-between px-3 pt-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#FBF5EC] flex items-center justify-center text-lg">
              {current.sellerAvatar}
            </div>
            <div>
              <div className="text-white text-sm font-semibold">{current.seller}</div>
              <div className="text-white/70 text-[10px]">{current.createdAt}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 relative">
          <img src={current.image} alt="" className="w-full h-full object-cover" />

          {/* Gradient overlays */}
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Text overlay */}
          {current.text && (
            <div className="absolute bottom-24 inset-x-0 text-center px-6">
              <p className="text-white text-lg font-medium drop-shadow-lg">
                {current.text}
              </p>
            </div>
          )}

          {/* Tap zones */}
          <button onClick={prev} className="absolute left-0 top-0 w-1/3 h-full" aria-label="Prev" />
          <button onClick={next} className="absolute right-0 top-0 w-1/3 h-full" aria-label="Next" />

          {/* Navigation arrows (desktop) */}
          {index > 0 && (
            <button
              onClick={prev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center text-white hover:bg-black/70 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {index < stories.length - 1 && (
            <button
              onClick={next}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 items-center justify-center text-white hover:bg-black/70 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bottom actions */}
        <div className="relative z-10 flex items-center gap-2 p-3 pb-safe bg-black/60">
          <div className="flex-1 bg-white/10 backdrop-blur rounded-full px-4 py-2.5 text-white/60 text-sm border border-white/20">
            Javob yozing...
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <Heart className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
            <Send className="w-5 h-5" />
          </button>
          {current.productLink && (
            <button
              onClick={() => onProductClick?.(current.productLink!)}
              className="btn-gold px-4 py-2.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Xarid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
