import { Card, Button } from "../components/UI";
import { BOT_CONFIG } from "../../config";
import { Shield, Bell, Globe, Database, Download } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 animate-fade-up max-w-4xl">
      {/* General */}
      <Card title="🏢 Умумий созламалар">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Платформа номи</label>
            <input defaultValue="Begim" className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635]" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Тавсиф</label>
            <textarea rows={2} defaultValue="O'zbek ayollarining uy shirinliklari bozori" className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635] resize-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Асосий тил</label>
            <select className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm">
              <option>Ўзбекча (лотин)</option>
              <option>Ўзбекча (кирилл)</option>
              <option>Русский</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Telegram bot */}
      <Card title="🤖 Telegram бот">
        <div className="space-y-3">
          <div className="bg-[#FBF5EC] rounded-2xl p-4">
            <div className="text-xs text-[#8B7355] mb-1">Бот username</div>
            <div className="font-mono text-sm font-semibold text-[#2B1810]">@{BOT_CONFIG.botUsername}</div>
          </div>
          <div className="bg-[#FBF5EC] rounded-2xl p-4">
            <div className="text-xs text-[#8B7355] mb-1">Mini App URL</div>
            <div className="font-mono text-sm font-semibold text-[#2B1810] break-all">{BOT_CONFIG.miniAppLink}</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <div className="text-xs font-semibold text-emerald-800">Бот фаол</div>
                <div className="text-[10px] text-emerald-700">Охирги ping: 23ms</div>
              </div>
            </div>
            <div className="bg-[#FBF5EC] rounded-2xl p-3">
              <div className="text-xs text-[#8B7355]">Умумий фойдаланувчи</div>
              <div className="font-[Cormorant_Garamond] text-xl font-bold text-[#2B1810]">4,892</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Moderation */}
      <Card title="⚖️ Модерация">
        <div className="space-y-3">
          {[
            { label: "Авто-тасдиқлаш сотувчилар", desc: "Янги сотувчилар автоматик фаол бўлади", checked: false },
            { label: "Шарҳлар модерацияси", desc: "Шарҳлар админ тасдиғидан кейин чиқади", checked: true },
            { label: "Community постлар модерацияси", desc: "Постлар модерациядан ўтади", checked: true },
            { label: "Сўкинч сўзлар филтри", desc: "Автоматик яшириш", checked: true },
          ].map((s, i) => (
            <label key={i} className="flex items-start gap-3 p-3 bg-[#FBF5EC] rounded-2xl cursor-pointer">
              <input type="checkbox" defaultChecked={s.checked} className="mt-1 accent-[#8B2635]" />
              <div>
                <div className="font-semibold text-sm text-[#2B1810]">{s.label}</div>
                <div className="text-xs text-[#8B7355]">{s.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      <Card title="🔔 Билдиришномалар">
        <div className="space-y-3">
          {[
            { icon: Bell, label: "Янги буюртма", desc: "Ҳар бир янги буюртма ҳақида хабар", on: true },
            { icon: Shield, label: "Янги сотувчи аризаси", desc: "Модерация учун", on: true },
            { icon: Bell, label: "Шикоятлар", desc: "Фойдаланувчи шикоятлари", on: true },
            { icon: Globe, label: "Ҳафталик ҳисобот", desc: "Аналитика email орқали", on: false },
          ].map((n, i) => {
            const Icon = n.icon;
            return (
              <div key={i} className="flex items-center gap-3 p-3 bg-[#FBF5EC] rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#8B2635]" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-[#2B1810]">{n.label}</div>
                  <div className="text-xs text-[#8B7355]">{n.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={n.on} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#8B2635] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Commission */}
      <Card title="💰 Комиссия">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Стандарт комиссия (%)</label>
            <input type="number" defaultValue="10" className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Бепул давр (кун)</label>
            <input type="number" defaultValue="30" className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#2B1810] mb-1.5">Минимал буюртма (сўм)</label>
            <input type="number" defaultValue="20000" className="w-full bg-[#FBF5EC] border border-[#C9A961]/30 rounded-2xl px-4 py-2.5 text-sm" />
          </div>
        </div>
      </Card>

      {/* Data export */}
      <Card title="📦 Маълумотлар">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="secondary" icon={<Download className="w-4 h-4" />}>
            Буюртмаларни юклаб олиш (CSV)
          </Button>
          <Button variant="secondary" icon={<Database className="w-4 h-4" />}>
            Backup яратиш
          </Button>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="secondary">Бекор қилиш</Button>
        <Button variant="primary">💾 Сақлаш</Button>
      </div>
    </div>
  );
}
