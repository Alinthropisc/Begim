import { Plus } from "lucide-react";
import { type Story } from "../data/products";

type Props = {
  stories: Story[];
  onOpen: (index: number) => void;
  onOpenApp?: () => void;
};

export default function StoriesBar({ stories, onOpen, onOpenApp }: Props) {
  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-[Cormorant_Garamond] text-2xl md:text-3xl font-semibold text-[#8B2635]">
          Yangiliklar
        </h2>
        <span className="text-xs text-[#8B7355]">Bugungi hikoyalar</span>
      </div>

      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        {/* Add story tile */}
        <button
          onClick={onOpenApp}
          className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px] md:w-[80px] group"
        >
          <div className="w-[72px] h-[72px] md:w-[80px] md:h-[80px] rounded-full bg-white border-2 border-dashed border-[#C9A961]/60 flex items-center justify-center group-hover:border-[#8B2635] group-hover:scale-105 transition">
            <Plus className="w-6 h-6 text-[#8B2635]" />
          </div>
          <span className="text-[10px] text-[#8B7355] text-center truncate w-full">Sizdan</span>
        </button>

        {stories.map((s, i) => (
          <button
            key={s.id}
            onClick={() => onOpen(i)}
            className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px] md:w-[80px] group"
          >
            <div
              className={`p-[2.5px] rounded-full ${
                s.viewed
                  ? "bg-[#C9A961]/30"
                  : "bg-gradient-to-tr from-[#C9A961] via-[#8B2635] to-[#E4CE8A]"
              }`}
            >
              <div className="bg-[#FBF5EC] p-[2px] rounded-full">
                <div className="w-[62px] h-[62px] md:w-[70px] md:h-[70px] rounded-full overflow-hidden border-2 border-white group-hover:scale-105 transition">
                  <img src={s.image} alt={s.seller} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
            <span className="text-[10px] text-[#2B1810] font-medium text-center truncate w-full">
              {s.seller.split(" ")[0]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
