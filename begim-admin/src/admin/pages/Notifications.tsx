import { useState } from "react";
import { Card } from "../components/UI";
import { Send, Users, Store, MapPin, Clock, CheckCircle2 } from "lucide-react";

type Segment = "all" | "buyers" | "sellers" | "city";
type NotifRecord = { id: string; text: string; segment: string; sentAt: string; delivered: number; opened: number };

const HISTORY: NotifRecord[] = [
  { id:"n1", text:"🎂 Yangi Napoleon torti sotuvda! Toshkentda bepul yetkazib berish", segment:"Toshkent", sentAt:"Bugun 10:00", delivered:1240, opened:389 },
  { id:"n2", text:"📦 Hafta oxiri — 10% chegirma! WEEKEND10 kodi bilan", segment:"Barcha xaridorlar", sentAt:"Kecha 18:00", delivered:4820, opened:1104 },
  { id:"n3", text:"👩‍🍳 Sotuvchilar uchun: yangi komissiya tarifi haqida", segment:"Barcha sotuvchilar", sentAt:"2 kun oldin", delivered:47, opened:41 },
];

const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Namangan", "Andijon", "Farg'ona"];

export default function Notifications({ lang }: { lang: "uz" | "ru" }) {
  const uz = lang === "uz";
  const [segment, setSegment] = useState<Segment>("all");
  const [city, setCity] = useState("Toshkent");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [history] = useState(HISTORY);

  const segmentLabel = (s: Segment) => {
    const map = { all: uz?"Hammaga":"Всем", buyers: uz?"Xaridorlar":"Покупатели", sellers: uz?"Sotuvchilar":"Продавцы", city: uz?"Shahar bo'yicha":"По городу" };
    return map[s];
  };

  const audienceSize = { all: 4867, buyers: 4820, sellers: 47, city: 1240 }[segment];

  const handleSend = () => {
    if (!text.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setText(""); }, 3000);
  };

  const segments: Segment[] = ["all", "buyers", "sellers", "city"];

  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: uz?"Jami foydalanuvchi":"Всего пользователей", value:"4 867", icon:"👥", color:"from-[#2D5F4E] to-[#16a34a]" },
          { label: uz?"Xaridorlar":"Покупатели", value:"4 820", icon:"🛍", color:"from-[#1a3a5c] to-[#2563eb]" },
          { label: uz?"Sotuvchilar":"Продавцы", value:"47", icon:"👩‍🍳", color:"from-[#8B2635] to-[#C9A961]" },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="font-bold text-xl">{k.value}</div>
            <div className="text-xs opacity-80 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <Card title={uz ? "Yangi xabar yuborish" : "Отправить уведомление"}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[#8B7355] uppercase tracking-wide mb-2 block">{uz?"Kimga":"Кому"}</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {segments.map(s => (
                <button key={s} type="button" onClick={() => setSegment(s)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${segment===s ? "bg-[#8B2635] text-white border-[#8B2635] shadow" : "bg-white text-[#2B1810] border-[#C9A961]/30 hover:border-[#C9A961]"}`}>
                  {s==="all"&&<Users className="w-3.5 h-3.5"/>}
                  {s==="buyers"&&<Store className="w-3.5 h-3.5"/>}
                  {s==="sellers"&&<CheckCircle2 className="w-3.5 h-3.5"/>}
                  {s==="city"&&<MapPin className="w-3.5 h-3.5"/>}
                  {segmentLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {segment === "city" && (
            <div>
              <label className="text-xs font-semibold text-[#8B7355] uppercase tracking-wide mb-2 block">{uz?"Shahar":"Город"}</label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(c => (
                  <button key={c} type="button" onClick={() => setCity(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${city===c ? "bg-[#8B2635] text-white" : "bg-[#FBF5EC] text-[#2B1810] border border-[#C9A961]/30"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#FBF5EC] rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[#8B7355]" />
            <span className="text-[#8B7355]">{uz?"Auditoriya:":"Аудитория:"}</span>
            <span className="font-bold text-[#2B1810]">{audienceSize?.toLocaleString()} {uz?"kishi":"чел."}</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#8B7355] uppercase tracking-wide mb-2 block">{uz?"Xabar matni":"Текст сообщения"}</label>
            <textarea value={text} onChange={e=>setText(e.target.value)} rows={4}
              placeholder={uz?"Xabar yozing...":"Напишите сообщение..."}
              className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#8B2635] transition" />
            <div className="text-xs text-[#8B7355] text-right mt-1">{text.length}/500</div>
          </div>

          {sent ? (
            <div className="w-full bg-[#2D5F4E]/10 text-[#2D5F4E] rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {uz?"Xabar yuborildi!":"Сообщение отправлено!"}
            </div>
          ) : (
            <button type="button" onClick={handleSend} disabled={!text.trim()}
              className="w-full bg-[#8B2635] disabled:opacity-40 text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow shadow-[#8B2635]/20 transition">
              <Send className="w-4 h-4" /> {uz?"Yuborish":"Отправить"} · {audienceSize?.toLocaleString()} {uz?"kishi":"чел."}
            </button>
          )}
        </div>
      </Card>

      <Card title={uz ? "Yuborilgan xabarlar" : "История рассылок"}>
        <div className="space-y-3">
          {history.map(h => (
            <div key={h.id} className="flex gap-4 py-3 border-b border-[#C9A961]/10 last:border-0">
              <div className="w-10 h-10 rounded-xl bg-[#FBF5EC] flex items-center justify-center text-lg flex-shrink-0">📣</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#2B1810] leading-snug line-clamp-2">{h.text}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[#8B7355]">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/>{h.segment}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3"/>{h.sentAt}</span>
                  <span className="text-[#2D5F4E] font-medium">↗ {Math.round(h.opened/h.delivered*100)}% {uz?"ochildi":"открыто"}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 text-xs text-[#8B7355]">
                <div className="font-bold text-[#2B1810]">{h.delivered.toLocaleString()}</div>
                <div>{uz?"yetkazildi":"доставлено"}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
