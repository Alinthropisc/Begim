import { useState } from "react";
import { Badge } from "../components/UI";
import { Search, ShoppingBag, Star, Ban, MessageCircle, ChevronRight } from "lucide-react";

type User = {
  id: string; name: string; username: string; avatar: string; city: string;
  joinedAt: string; ordersCount: number; totalSpent: number;
  status: "active" | "blocked"; isPremium: boolean; lastSeen: string;
};

const USERS: User[] = [
  { id:"u1", name:"Malika Toshmatova", username:"@malika_t", avatar:"👩", city:"Toshkent", joinedAt:"Jan 2026", ordersCount:12, totalSpent:980000, status:"active", isPremium:true, lastSeen:"5 min oldin" },
  { id:"u2", name:"Sardor Mirzayev", username:"@sardor_m", avatar:"👨", city:"Toshkent", joinedAt:"Feb 2026", ordersCount:8, totalSpent:720000, status:"active", isPremium:false, lastSeen:"1 soat oldin" },
  { id:"u3", name:"Nargiza Xoliqova", username:"@nargiza_x", avatar:"👩‍🦱", city:"Samarqand", joinedAt:"Mar 2026", ordersCount:5, totalSpent:450000, status:"active", isPremium:false, lastSeen:"Bugun" },
  { id:"u4", name:"Dilrabo Karimova", username:"@dilrabo_k", avatar:"👩‍🦰", city:"Toshkent", joinedAt:"Jan 2026", ordersCount:21, totalSpent:1840000, status:"active", isPremium:true, lastSeen:"30 min oldin" },
  { id:"u5", name:"Aziz Nazarov", username:"@aziz_n", avatar:"👨‍💼", city:"Namangan", joinedAt:"Apr 2026", ordersCount:2, totalSpent:90000, status:"blocked", isPremium:false, lastSeen:"3 kun oldin" },
  { id:"u6", name:"Feruza Razzaqova", username:"@feruza_r", avatar:"👩‍🎤", city:"Buxoro", joinedAt:"Feb 2026", ordersCount:7, totalSpent:630000, status:"active", isPremium:false, lastSeen:"2 soat oldin" },
];

const fp = (n: number) => (n/1000).toFixed(0) + "K so'm";

export default function Users({ lang }: { lang: "uz" | "ru" }) {
  const uz = lang === "uz";
  const [users, setUsers] = useState(USERS);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<User|null>(null);
  const [filter, setFilter] = useState<"all"|"active"|"blocked"|"premium">("all");

  const toggleBlock = (id: string) =>
    setUsers(p => p.map(u => u.id===id ? {...u, status: u.status==="active"?"blocked":"active"} : u));

  const filtered = users
    .filter(u => filter==="all" || (filter==="blocked"?u.status==="blocked":filter==="premium"?u.isPremium:u.status==="active"))
    .filter(u => !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.username.includes(query));

  const topSpenders = [...users].sort((a,b)=>b.totalSpent-a.totalSpent).slice(0,3);

  const filters: { id: typeof filter; uz: string; ru: string }[] = [
    { id:"all",     uz:"Barchasi", ru:"Все" },
    { id:"active",  uz:"Faol",     ru:"Активные" },
    { id:"premium", uz:"Premium",  ru:"Premium" },
    { id:"blocked", uz:"Bloklangan",ru:"Заблокированные" },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:uz?"Jami xaridorlar":"Всего покупателей", value:"4 820", icon:"👥", color:"from-[#2D5F4E] to-[#16a34a]" },
          { label:uz?"Bugun yangilari":"Новых сегодня",     value:"18",    icon:"✨", color:"from-[#8B2635] to-[#C9A961]" },
          { label:uz?"Premium foydalanuvchilar":"Premium",  value:"312",   icon:"⭐", color:"from-[#6B3F1A] to-[#C9A961]" },
          { label:uz?"Bloklangan":"Заблокированных",        value:users.filter(u=>u.status==="blocked").length.toString(), icon:"🚫", color:"from-[#1a3a5c] to-[#2563eb]" },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="font-bold text-xl">{k.value}</div>
            <div className="text-xs opacity-80 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-4">
        <div className="text-xs font-semibold text-[#8B7355] uppercase tracking-wide mb-3">{uz?"Top xaridorlar":"Топ покупатели"}</div>
        <div className="flex gap-3">
          {topSpenders.map((u, i) => (
            <div key={u.id} className="flex-1 bg-[#FBF5EC] rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{["🥇","🥈","🥉"][i]}</div>
              <div className="text-2xl">{u.avatar}</div>
              <div className="text-xs font-semibold text-[#2B1810] mt-1 truncate">{u.name.split(" ")[0]}</div>
              <div className="text-xs font-bold text-[#8B2635]">{fp(u.totalSpent)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B7355]" />
          <input value={query} onChange={e=>setQuery(e.target.value)}
            placeholder={uz?"Ism yoki @username...":"Имя или @username..."}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C9A961]/30 rounded-xl text-sm focus:outline-none focus:border-[#8B2635]" />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {filters.map(f => {
          const count = f.id==="all"?users.length:f.id==="blocked"?users.filter(u=>u.status==="blocked").length:f.id==="premium"?users.filter(u=>u.isPremium).length:users.filter(u=>u.status==="active").length;
          return (
            <button key={f.id} type="button" onClick={()=>setFilter(f.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${filter===f.id?"bg-[#8B2635] text-white":"bg-white border border-[#C9A961]/30 text-[#2B1810] hover:border-[#C9A961]"}`}>
              {uz?f.uz:f.ru} <span className="opacity-60 ml-1">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-2">
        {filtered.map(u => (
          <div key={u.id} onClick={()=>setSelected(selected?.id===u.id?null:u)}
            className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-4 flex items-center gap-3 cursor-pointer hover:border-[#C9A961] transition">
            <div className="w-11 h-11 rounded-full bg-[#FBF5EC] flex items-center justify-center text-xl flex-shrink-0">{u.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#2B1810]">{u.name}</span>
                {u.isPremium && <span className="text-[9px] bg-gradient-to-r from-[#C9A961] to-[#E4CE8A] text-[#2B1810] font-bold px-1.5 py-0.5 rounded-full">⭐ PREMIUM</span>}
                {u.status==="blocked" && <Badge className="bg-red-50 text-red-600 border-red-200 text-[9px] py-0.5">{uz?"Bloklangan":"Заблок."}</Badge>}
              </div>
              <div className="text-xs text-[#8B7355]">{u.username} · {u.city}</div>
            </div>
            <div className="text-right flex-shrink-0 text-xs text-[#8B7355]">
              <div className="font-bold text-[#8B2635]">{fp(u.totalSpent)}</div>
              <div className="flex items-center gap-1 justify-end"><ShoppingBag className="w-3 h-3"/>{u.ordersCount}</div>
            </div>
            <ChevronRight className={`w-4 h-4 text-[#C9A961] transition ${selected?.id===u.id?"rotate-90":""}`} />
          </div>
        ))}
      </div>

      {selected && (
        <div className="bg-white rounded-3xl border border-[#C9A961]/20 shadow-lg p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FBF5EC] flex items-center justify-center text-4xl">{selected.avatar}</div>
            <div>
              <h3 className="font-[Cormorant_Garamond] text-xl font-semibold text-[#8B2635]">{selected.name}</h3>
              <div className="text-sm text-[#8B7355]">{selected.username} · {selected.city}</div>
              <div className="text-xs text-[#8B7355]">{uz?"Qo'shildi:":"Присоединился:"} {selected.joinedAt} · {uz?"Oxirgi faollik:":"Активность:"} {selected.lastSeen}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:uz?"Buyurtmalar":"Заказы", value:selected.ordersCount, icon:<ShoppingBag className="w-4 h-4"/> },
              { label:uz?"Umumiy xarid":"Потрачено", value:fp(selected.totalSpent), icon:<Star className="w-4 h-4"/> },
              { label:uz?"Status":"Статус", value:selected.status==="active"?(uz?"Faol":"Активен"):(uz?"Bloklangan":"Заблок."), icon:<Ban className="w-4 h-4"/> },
            ].map(s => (
              <div key={s.label} className="bg-[#FBF5EC] rounded-xl p-3 text-center">
                <div className="flex justify-center text-[#8B7355] mb-1">{s.icon}</div>
                <div className="font-bold text-sm text-[#2B1810]">{s.value}</div>
                <div className="text-[10px] text-[#8B7355]">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex-1 border border-[#229ED9] text-[#229ED9] rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-[#229ED9]/5 transition">
              <MessageCircle className="w-4 h-4"/> {uz?"Xabar yuborish":"Написать"}
            </button>
            <button type="button" onClick={()=>toggleBlock(selected.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 transition ${selected.status==="active"?"bg-red-50 text-red-600 border border-red-200 hover:bg-red-100":"bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100"}`}>
              <Ban className="w-4 h-4"/> {selected.status==="active"?(uz?"Bloklash":"Заблокировать"):(uz?"Blokni ochish":"Разблокировать")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
