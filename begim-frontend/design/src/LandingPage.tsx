import { useState } from "react";
import {
  Send, Store, Users, Shield, Star, ChevronRight,
  Sparkles, MapPin, CheckCircle2, ArrowRight, Play,
  Heart, ShoppingBag, Phone
} from "lucide-react";
import { products, formatPrice } from "./data/products";
import { sellers } from "./data/sellers";
import { BOT_CONFIG } from "./config";

const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Namangan", "Andijon", "Farg'ona",
  "Nukus", "Qarshi", "Termiz", "Jizzax", "Sirdaryo", "Navoiy", "Urganch"];

export default function LandingPage({ onEnterShop }: { onEnterShop: () => void }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const featured = products.slice(0, 4);
  const topSellers = sellers.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBF5EC]">
      {/* ── TOP BAR ── */}
      <div className="bg-gradient-to-r from-[#229ED9] to-[#1a7fb0] text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Mini App orqali yanada qulayroq xarid qiling!</span>
          </div>
          <a href={BOT_CONFIG.miniAppLink} target="_blank" rel="noreferrer"
            className="text-xs font-bold bg-white text-[#229ED9] px-3 py-1 rounded-full hover:scale-105 transition">
            Ochish →
          </a>
        </div>
      </div>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-[#FBF5EC]/95 backdrop-blur-md border-b border-[#C9A961]/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B2635] to-[#6B1A27] flex items-center justify-center ring-2 ring-[#C9A961]/30">
              <span className="text-[#E4CE8A] font-bold text-lg" style={{ fontFamily: "Amiri, serif" }}>ب</span>
            </div>
            <div className="leading-tight">
              <div className="text-2xl font-semibold text-[#8B2635]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Begim</div>
              <div className="text-[10px] uppercase tracking-widest text-[#8B7355] -mt-1">uy bozori</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Bosh", href: "#hero" },
              { label: "Mahsulotlar", href: "#products" },
              { label: "Sotuvchilar", href: "#sellers" },
              { label: "Hamjamiyat", href: "#community" },
            ].map((n) => (
              <a key={n.label} href={n.href}
                className="px-4 py-2 rounded-full text-sm font-medium text-[#2B1810] hover:bg-[#C9A961]/10 transition">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={onEnterShop}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#8B2635] text-[#FBF5EC] text-sm font-semibold hover:bg-[#6B1A27] transition shadow-md">
              <ShoppingBag className="w-4 h-4" /> Xarid qilish
            </button>
            <a href={BOT_CONFIG.miniAppLink} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#229ED9] text-white text-sm font-semibold hover:bg-[#1a7fb0] transition">
              <Send className="w-4 h-4" /> Telegram
            </a>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-br from-[#8B2635] via-[#6B1A27] to-[#8B2635] text-[#FBF5EC] begim-pattern-dark">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C9A961]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#E4CE8A]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#FBF5EC]/10 backdrop-blur rounded-full px-4 py-1.5 mb-6 text-sm">
                <Sparkles className="w-4 h-4 text-[#E4CE8A]" />
                <span className="text-[#E4CE8A] font-medium">O'zbekistonning #1 uy bozori</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-semibold leading-[1.02] mb-6"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>
                Uy shirinliklari,<br />
                <span className="text-shimmer-gold">mehribon qo'llardan</span>
              </h1>

              <p className="text-[#F3E8D4]/80 text-lg mb-8 max-w-lg leading-relaxed">
                Begim — O'zbekiston bo'ylab ayollar tomonidan tayyorlangan non, shirinlik va somsalarning
                eng yaxshi bozori. Halol, sifatli, uyda tayyorlangan.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <button onClick={onEnterShop}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C9A961] text-[#2B1810] font-bold text-sm hover:bg-[#E4CE8A] transition shadow-lg">
                  <ShoppingBag className="w-4 h-4" /> Xarid boshlash
                </button>
                <a href={BOT_CONFIG.miniAppLink} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-7 py-3.5 rounded-full border border-[#E4CE8A]/40 text-sm font-semibold hover:bg-[#FBF5EC]/10 transition">
                  <Send className="w-4 h-4" /> Telegram orqali
                </a>
              </div>

              <div className="flex gap-8">
                {[
                  { n: "1 200+", l: "Uy bekalari" },
                  { n: "14", l: "Shaharlar" },
                  { n: "4.9★", l: "O'rtacha baho" },
                  { n: "50K+", l: "Buyurtmalar" },
                ].map((s) => (
                  <div key={s.l}>
                    <div className="text-2xl font-bold text-[#E4CE8A]"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}>{s.n}</div>
                    <div className="text-xs text-[#F3E8D4]/70">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-[#C9A961]/20 rounded-full blur-3xl scale-110" />
                <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-[#C9A961]/20 to-transparent border-2 border-[#E4CE8A]/30 flex items-center justify-center">
                  <span className="text-[200px] leading-none select-none">🥮</span>
                </div>
                {[
                  { style: "top-4 right-0", icon: "🎂", title: "Napoleon torti", sub: "185 000 so'm" },
                  { style: "bottom-8 left-0", icon: "🥟", title: "Tandirda somsa", sub: "12 000 so'm" },
                  { style: "top-1/2 -right-8", icon: "🫓", title: "Samarqand noni", sub: "18 000 so'm" },
                ].map((card) => (
                  <div key={card.title}
                    className={`absolute ${card.style} bg-white text-[#2B1810] rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2 text-sm`}>
                    <span className="text-2xl">{card.icon}</span>
                    <div>
                      <div className="font-semibold text-xs">{card.title}</div>
                      <div className="text-[#8B2635] font-bold text-xs">{card.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-6 begim-ornament opacity-40 mt-4" />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#C9A961]/10 rounded-full px-4 py-1.5 mb-4 text-sm font-medium text-[#8B7355]">
            <Play className="w-3.5 h-3.5" /> Qanday ishlaydi?
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold text-[#8B2635]"
            style={{ fontFamily: "Cormorant Garamond, serif" }}>
            3 qadamda xarid qiling
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", icon: "🔍", title: "Tanlang", desc: "14 ta shahardan 1200+ uy bekasining mahsulotlarini ko'ring. Kategoriya, narx, shahar bo'yicha filtrlang." },
            { step: "02", icon: "🛒", title: "Buyurtma bering", desc: "Savatga qo'shing va buyurtmani rasmiylashtiring. Telegram orqali yoki to'g'ridan-to'g'ri saytdan." },
            { step: "03", icon: "🚀", title: "Oling", desc: "Sotuvchi siz bilan bog'lanadi. Yetkazib berish yoki o'zingiz olib ketish. Tezda, yangi holda!" },
          ].map((s) => (
            <div key={s.step}
              className="relative bg-white rounded-3xl p-8 border border-[#C9A961]/20 hover:border-[#C9A961] hover:shadow-lg transition group">
              <div className="text-[80px] font-bold text-[#C9A961]/10 absolute top-4 right-6 leading-none select-none"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>{s.step}</div>
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-2xl font-semibold text-[#8B2635] mb-2"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>{s.title}</h3>
              <p className="text-[#8B7355] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium text-[#8B7355] mb-2">Eng mashhur mahsulotlar</p>
              <h2 className="text-4xl md:text-5xl font-semibold text-[#8B2635]"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>Bugungi tanlov</h2>
            </div>
            <button onClick={onEnterShop}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#8B2635] hover:gap-3 transition-all">
              Barchasini ko'rish <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p) => (
              <div key={p.id}
                className="product-card bg-[#FBF5EC] rounded-2xl overflow-hidden border border-[#C9A961]/20 cursor-pointer group"
                onClick={onEnterShop}>
                <div className="relative aspect-square overflow-hidden bg-white">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-2 left-2 flex gap-1 flex-col">
                    {p.badges?.map((b) => (
                      <span key={b} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2D5F4E] text-white">{b}</span>
                    ))}
                  </div>
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#8B7355]" />
                  </button>
                </div>
                <div className="p-3">
                  <div className="text-xs text-[#8B7355] mb-1">{p.sellerAvatar} {p.seller}</div>
                  <h3 className="font-semibold text-[#2B1810] text-sm leading-snug line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Star className="w-3 h-3 fill-[#C9A961] text-[#C9A961]" />
                    <span className="font-semibold">{p.rating}</span>
                    <span className="text-[#8B7355]">({p.reviewsCount})</span>
                  </div>
                  <div className="mt-2 font-bold text-[#8B2635]"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}>
                    {formatPrice(p.price)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={onEnterShop}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#8B2635] text-white font-semibold hover:bg-[#6B1A27] transition shadow-md">
              <ShoppingBag className="w-4 h-4" /> Barcha {products.length}+ mahsulotni ko'rish
            </button>
          </div>
        </div>
      </section>

      {/* ── SELLERS ── */}
      <section id="sellers" className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium text-[#8B7355] mb-2">Eng yaxshi oshpazlar</p>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#8B2635]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}>Top sotuvchilar</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {topSellers.map((s) => (
            <div key={s.id}
              className="bg-white rounded-3xl p-6 border border-[#C9A961]/20 hover:border-[#C9A961] hover:shadow-lg transition cursor-pointer text-center group"
              onClick={onEnterShop}>
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[#8B2635]/10 to-[#C9A961]/10 flex items-center justify-center text-5xl mb-4 group-hover:scale-110 transition">
                {s.avatar}
              </div>
              {s.badge && (
                <div className="inline-block text-[10px] font-bold bg-[#8B2635] text-white px-2 py-0.5 rounded-full mb-2">
                  {s.badge}
                </div>
              )}
              <h3 className="font-semibold text-[#2B1810]">{s.name}</h3>
              <div className="flex items-center justify-center gap-1 text-xs text-[#8B7355] mt-1">
                <MapPin className="w-3 h-3" /> {s.city}
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-sm">
                <Star className="w-3.5 h-3.5 fill-[#C9A961] text-[#C9A961]" />
                <span className="font-bold text-[#2B1810]">{s.rating}</span>
                <span className="text-[#8B7355] text-xs">({s.reviewsCount})</span>
              </div>
              <div className="mt-2 text-xs text-[#8B7355]">{s.productsCount} ta mahsulot</div>
              {s.halal && (
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#2D5F4E]">
                  <Shield className="w-3 h-3" /> Halol
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="py-16 bg-gradient-to-br from-[#2D5F4E] to-[#1f4538] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold mb-2"
              style={{ fontFamily: "Cormorant Garamond, serif" }}>14 ta shahar</h2>
            <p className="text-[#F3E8D4]/70">O'zbekiston bo'ylab yetkazamiz</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {CITIES.map((c) => (
              <button key={c} onClick={onEnterShop}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-[#C9A961] hover:text-[#2B1810] text-sm font-medium transition border border-white/10">
                <MapPin className="w-3 h-3 inline mr-1" />{c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR SELLERS CTA ── */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#8B2635] to-[#6B1A27] text-white p-10 md:p-16 begim-pattern-dark">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#C9A961]/20 rounded-full blur-2xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#E4CE8A]/20 rounded-full px-3 py-1 mb-4 text-xs text-[#E4CE8A]">
                <Store className="w-3 h-3" /> Biznes imkoniyati
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold mb-4"
                style={{ fontFamily: "Cormorant Garamond, serif" }}>
                O'z shirinliklaringizni soting
              </h2>
              <p className="text-[#F3E8D4]/80 mb-6 text-lg">
                Begim platformasida o'z do'koningizni oching — <strong>0% komissiya birinchi oy</strong>.
                Minglab xaridorga yeting. Arizangiz 24 soat ichida ko'rib chiqiladi.
              </p>
              <ul className="space-y-2 mb-8 text-[#F3E8D4]/90">
                {[
                  "Bepul ro'yxatdan o'tish",
                  "Oddiy buyurtma boshqaruvi",
                  "To'g'ridan-to'g'ri to'lov",
                  "24/7 qo'llab-quvvatlash",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#E4CE8A] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onEnterShop}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#C9A961] text-[#2B1810] font-bold hover:bg-[#E4CE8A] transition shadow-lg">
                <Store className="w-4 h-4" /> Sotuvchi bo'lish <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="text-[160px] leading-none select-none">👩‍🍳</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY TEASER ── */}
      <section id="community" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#2D5F4E]/10 rounded-full px-4 py-1.5 mb-4 text-sm text-[#2D5F4E] font-medium">
              <Users className="w-4 h-4" /> Hamjamiyat
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold text-[#8B2635]"
              style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Oshpazlar jamoasi
            </h2>
            <p className="text-[#8B7355] mt-2 max-w-xl mx-auto">
              Retseptlar, tajribalar, yangi do'stlik. O'z ishingizni baham ko'ring.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "📖", title: "Retseptlar", count: "240+", desc: "Uyda tayyorlash uchun eng yaxshi retseptlar" },
              { emoji: "💬", title: "Muhokamalar", count: "1.2K", desc: "Maslahat, javob, hamkorlik" },
              { emoji: "🏆", title: "Tanlovlar", count: "Har oy", desc: "Eng yaxshi oshpaz tanlovlari va mukofotlar" },
            ].map((c) => (
              <div key={c.title}
                className="rounded-3xl bg-[#FBF5EC] border border-[#C9A961]/20 p-8 text-center hover:border-[#C9A961] hover:shadow-md transition">
                <div className="text-5xl mb-4">{c.emoji}</div>
                <div className="text-3xl font-bold text-[#8B2635] mb-1"
                  style={{ fontFamily: "Cormorant Garamond, serif" }}>{c.count}</div>
                <h3 className="font-semibold text-[#2B1810] mb-2">{c.title}</h3>
                <p className="text-sm text-[#8B7355]">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button onClick={onEnterShop}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#2D5F4E] text-white font-semibold hover:bg-[#1f4538] transition shadow-md">
              <Users className="w-4 h-4" /> Jamoaga qo'shilish
            </button>
          </div>
        </div>
      </section>

      {/* ── TELEGRAM CTA ── */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="rounded-3xl bg-gradient-to-br from-[#229ED9] to-[#1a7fb0] text-white p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><circle cx='30' cy='30' r='20' fill='none' stroke='white' stroke-width='1'/></svg>\")" }} />
          <div className="relative">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-4xl md:text-5xl font-semibold mb-4"
              style={{ fontFamily: "Cormorant Garamond, serif" }}>
              Telegram Mini App
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
              Eng qulay xarid tajribasi — to'g'ridan-to'g'ri Telegram ichida.
              Bildirishnomalar, tez buyurtma, bot bilan muloqot.
            </p>
            <a href={BOT_CONFIG.startLink} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-[#229ED9] font-bold text-lg hover:shadow-xl transition">
              <Send className="w-5 h-5" /> Telegram'da ochish
            </a>
            <div className="mt-4 text-white/60 text-sm">@{BOT_CONFIG.botUsername}</div>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-12 bg-[#FBF5EC] border-t border-[#C9A961]/20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-[#8B2635] mb-2"
            style={{ fontFamily: "Cormorant Garamond, serif" }}>Yangiliklar</h3>
          <p className="text-sm text-[#8B7355] mb-4">Yangi sotuvchilar va maxsus takliflar haqida birinchi bo'lib biling</p>
          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-[#2D5F4E] font-semibold">
              <CheckCircle2 className="w-5 h-5" /> Rahmat! Siz ro'yxatga qo'shildingiz.
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="flex gap-2 max-w-md mx-auto">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="email@misol.uz" required
                className="flex-1 border border-[#C9A961]/30 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#8B2635] transition" />
              <button type="submit"
                className="px-5 py-2.5 rounded-full bg-[#8B2635] text-white text-sm font-semibold hover:bg-[#6B1A27] transition">
                Obuna
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="begim-pattern-dark text-[#FBF5EC]">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C9A961] flex items-center justify-center">
                <span className="text-[#8B2635] font-bold text-lg" style={{ fontFamily: "Amiri, serif" }}>ب</span>
              </div>
              <span className="text-3xl font-semibold" style={{ fontFamily: "Cormorant Garamond, serif" }}>Begim</span>
            </div>
            <p className="text-[#F3E8D4]/70 max-w-sm text-sm leading-relaxed">
              O'zbek ayollarining uyda tayyorlangan shirinlik va non mahsulotlari bozori.
              Halol, sifatli, mehribon qo'llardan.
            </p>
            <div className="mt-4 h-6 begim-ornament opacity-50" />
          </div>

          <div>
            <h4 className="text-xl mb-3 text-[#E4CE8A]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Havolalar</h4>
            <ul className="space-y-2 text-[#F3E8D4]/70 text-sm">
              {[
                { label: "Bosh sahifa", action: () => window.scrollTo(0, 0) },
                { label: "Katalog", action: onEnterShop },
                { label: "Sotuvchilar", action: onEnterShop },
                { label: "Hamjamiyat", action: onEnterShop },
                { label: "Admin", action: () => { window.location.href = "/admin"; } },
              ].map((l) => (
                <li key={l.label}>
                  <button onClick={l.action} className="hover:text-[#E4CE8A] transition">{l.label}</button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xl mb-3 text-[#E4CE8A]" style={{ fontFamily: "Cormorant Garamond, serif" }}>Aloqa</h4>
            <ul className="space-y-2 text-[#F3E8D4]/70 text-sm">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +998 90 123 45 67</li>
              <li className="flex items-center gap-2"><Send className="w-4 h-4" /> @{BOT_CONFIG.botUsername}</li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Toshkent, O'zbekiston</li>
            </ul>
            <a href={BOT_CONFIG.channelLink} target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 btn-gold px-4 py-2 rounded-full text-xs font-semibold">
              <Send className="w-3 h-3" /> Telegram kanal
            </a>
          </div>
        </div>
        <div className="border-t border-[#C9A961]/20 py-4 text-center text-sm text-[#F3E8D4]/50">
          © 2026 Begim. Barcha huquqlar himoyalangan. ✦ Bismillahir Rohmanir Rohiym ✦
        </div>
      </footer>
    </div>
  );
}
