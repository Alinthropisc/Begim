import { useState } from "react";
import { Card, Badge } from "../components/UI";
import { Plus, Copy, Trash2, CheckCircle2 } from "lucide-react";

type Promo = {
  id: string; code: string; type: "percent" | "fixed"; value: number;
  minOrder: number; usedCount: number; maxUses: number;
  validUntil: string; status: "active" | "expired" | "paused";
};

const PROMOS: Promo[] = [
  { id:"p1", code:"BEGIM10", type:"percent", value:10, minOrder:50000, usedCount:84, maxUses:200, validUntil:"30.06.2026", status:"active" },
  { id:"p2", code:"WELCOME", type:"fixed", value:20000, minOrder:0, usedCount:312, maxUses:1000, validUntil:"31.12.2026", status:"active" },
  { id:"p3", code:"RAMAZON", type:"percent", value:20, minOrder:80000, usedCount:156, maxUses:156, validUntil:"05.04.2026", status:"expired" },
  { id:"p4", code:"SUMMER25", type:"percent", value:25, minOrder:100000, usedCount:12, maxUses:100, validUntil:"31.08.2026", status:"paused" },
];

const statusConf = {
  active:  { uz:"Faol",        ru:"Активный",  color:"bg-emerald-50 text-emerald-700 border-emerald-200" },
  expired: { uz:"Muddati o'tdi",ru:"Истёк",    color:"bg-gray-100 text-gray-500 border-gray-200" },
  paused:  { uz:"To'xtatildi", ru:"Приостановлен", color:"bg-amber-50 text-amber-700 border-amber-200" },
};

const fp = (n: number) => n.toLocaleString("ru");

export default function Promos({ lang }: { lang: "uz" | "ru" }) {
  const uz = lang === "uz";
  const [promos, setPromos] = useState(PROMOS);
  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string|null>(null);
  const [form, setForm] = useState({ code:"", type:"percent" as "percent"|"fixed", value:"", minOrder:"", maxUses:"", validUntil:"" });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(()=>{});
    setCopied(code);
    setTimeout(()=>setCopied(null), 2000);
  };

  const toggleStatus = (id: string) =>
    setPromos(p => p.map(pr => pr.id===id ? {...pr, status: pr.status==="active"?"paused":"active"} : pr));

  const deletePromo = (id: string) => setPromos(p => p.filter(pr => pr.id !== id));

  const addPromo = () => {
    if (!form.code || !form.value) return;
    setPromos(p => [...p, {
      id: `p${Date.now()}`, code: form.code.toUpperCase(),
      type: form.type, value: Number(form.value),
      minOrder: Number(form.minOrder)||0, usedCount: 0,
      maxUses: Number(form.maxUses)||999, validUntil: form.validUntil||"31.12.2026", status: "active"
    }]);
    setShowForm(false);
    setForm({ code:"", type:"percent", value:"", minOrder:"", maxUses:"", validUntil:"" });
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:uz?"Faol kodlar":"Активных кодов", value:promos.filter(p=>p.status==="active").length, icon:"🎟", color:"from-[#8B2635] to-[#C9A961]" },
          { label:uz?"Jami ishlatildi":"Всего использовано", value:promos.reduce((s,p)=>s+p.usedCount,0), icon:"✅", color:"from-[#2D5F4E] to-[#16a34a]" },
          { label:uz?"Tejagan (so'm)":"Сэкономлено (сум)", value:fp(promos.reduce((s,p)=>s+p.usedCount*(p.type==="fixed"?p.value:p.minOrder*p.value/100),0)), icon:"💰", color:"from-[#1a3a5c] to-[#2563eb]" },
          { label:uz?"Muddati o'tgan":"Истёкших", value:promos.filter(p=>p.status==="expired").length, icon:"⏰", color:"from-[#6B3F1A] to-[#C9A961]" },
        ].map(k => (
          <div key={k.label} className={`bg-gradient-to-br ${k.color} rounded-2xl p-4 text-white`}>
            <div className="text-2xl mb-2">{k.icon}</div>
            <div className="font-bold text-xl">{k.value}</div>
            <div className="text-xs opacity-80 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={() => setShowForm(v=>!v)}
          className="bg-[#8B2635] text-white rounded-2xl px-5 py-2.5 text-sm font-semibold flex items-center gap-2 shadow shadow-[#8B2635]/20">
          <Plus className="w-4 h-4" /> {uz?"Yangi promo kod":"Новый промокод"}
        </button>
      </div>

      {showForm && (
        <Card title={uz?"Yangi kod yaratish":"Создать новый код"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:"code",     label:uz?"Kod":"Код",                 placeholder:"BEGIM10",  type:"text" },
              { key:"value",    label:uz?"Chegirma miqdori":"Размер скидки", placeholder:uz?"10 yoki 20000":"10 или 20000", type:"number" },
              { key:"minOrder", label:uz?"Min buyurtma":"Мин. заказ",  placeholder:"50000",    type:"number" },
              { key:"maxUses",  label:uz?"Maks foydalanish":"Макс. использований", placeholder:"100", type:"number" },
              { key:"validUntil",label:uz?"Amal qilish muddati":"Срок действия", placeholder:"31.12.2026", type:"text" },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-semibold text-[#8B7355] block mb-1">{f.label}</label>
                <input value={(form as any)[f.key]} type={f.type}
                  onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#8B2635]" />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-[#8B7355] block mb-1">{uz?"Turi":"Тип"}</label>
              <div className="flex gap-2">
                {(["percent","fixed"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setForm(p=>({...p,type:t}))}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition ${form.type===t?"bg-[#8B2635] text-white border-[#8B2635]":"bg-white text-[#2B1810] border-[#C9A961]/30"}`}>
                    {t==="percent" ? (uz?"%  foiz":"% процент") : (uz?"So'm":"Сум")}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button type="button" onClick={addPromo}
            className="mt-4 w-full bg-[#2D5F4E] text-white rounded-2xl py-3 text-sm font-semibold">
            {uz?"Saqlash":"Сохранить"}
          </button>
        </Card>
      )}

      <div className="space-y-3">
        {promos.map(promo => {
          const sc = statusConf[promo.status];
          const pct = Math.round(promo.usedCount / promo.maxUses * 100);
          return (
            <div key={promo.id} className="bg-white rounded-2xl border border-[#C9A961]/20 shadow-sm p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#FBF5EC] flex items-center justify-center flex-shrink-0">
                  <span className="font-[Cormorant_Garamond] font-bold text-[#8B2635] text-sm text-center leading-tight">{promo.code}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#2B1810]">{promo.code}</span>
                    <Badge className={sc.color}>{uz?sc.uz:sc.ru}</Badge>
                    <span className="text-xs font-bold text-[#8B2635]">
                      {promo.type==="percent" ? `-${promo.value}%` : `-${fp(promo.value)} so'm`}
                    </span>
                  </div>
                  <div className="text-xs text-[#8B7355] mt-0.5">
                    {uz?"Min buyurtma:":"Мин. заказ:"} {fp(promo.minOrder)} · {uz?"Muddati:":"До:"} {promo.validUntil}
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-[#8B7355] mb-1">
                      <span>{promo.usedCount} / {promo.maxUses} {uz?"marta":"раз"}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-[#FBF5EC] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#8B2635] to-[#C9A961] rounded-full transition-all" style={{width:`${Math.min(pct,100)}%`}} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button type="button" onClick={() => copyCode(promo.code)}
                    className="w-8 h-8 rounded-lg bg-[#FBF5EC] flex items-center justify-center hover:bg-[#C9A961]/20 transition">
                    {copied===promo.code ? <CheckCircle2 className="w-4 h-4 text-[#2D5F4E]"/> : <Copy className="w-4 h-4 text-[#8B7355]"/>}
                  </button>
                  {promo.status !== "expired" && (
                    <button type="button" onClick={() => toggleStatus(promo.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition text-xs font-bold ${promo.status==="active"?"bg-amber-50 text-amber-600 hover:bg-amber-100":"bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                      {promo.status==="active" ? "⏸" : "▶"}
                    </button>
                  )}
                  <button type="button" onClick={() => deletePromo(promo.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4 text-red-500"/>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
