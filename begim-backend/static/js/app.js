/* ============================================================
   BEGIM — App Logic (Tailwind & Lucide Optimized)
   ============================================================ */

// --- Telegram ---
const tg = window.Telegram?.WebApp;
if (tg) { 
    tg.ready(); 
    tg.expand(); 
    tg.headerColor = '#C8963E';
}

// --- State ---
const S = {
    page:       'splash',
    history:    [],
    cart:       [],
    product:    null,
    qty:        1,
    category:   'all',
    obSlide:    0,
    isFav:      false,
};

// ============================================================
// РОУТЕР
// ============================================================

const NO_NAV = ['splash', 'onboarding', 'product'];

function navigateTo(page) {
    const cur  = document.getElementById(`page-${S.page}`);
    const next = document.getElementById(`page-${page}`);
    if (!next) return;

    S.history.push(S.page);
    S.page = page;

    if (cur)  { 
        cur.classList.add('hidden'); 
        cur.classList.remove('active');
    }
    next.classList.remove('hidden');
    next.classList.add('active');

    const nav = document.getElementById('bottom-nav');
    if (NO_NAV.includes(page)) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-item').forEach(b => {
        const isActive = b.dataset.page === page;
        b.classList.toggle('text-primary', isActive);
        b.classList.toggle('text-dark/30', !isActive);
    });

    const renders = {
        home:    renderHome,
        catalog: renderCatalog,
        cart:    renderCart,
    };
    renders[page]?.();
    window.scrollTo({ top: 0 });
    lucide.createIcons();
}

function goBack() {
    if (!S.history.length) return;
    const prev = S.history.pop();
    const cur  = document.getElementById(`page-${S.page}`);
    const next = document.getElementById(`page-${prev}`);
    
    if (cur) {
        cur.classList.add('hidden');
        cur.classList.remove('active');
    }
    if (next) {
        next.classList.remove('hidden');
        next.classList.add('active');
    }
    
    S.page = prev;

    const nav = document.getElementById('bottom-nav');
    if (NO_NAV.includes(prev)) {
        nav.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
    }

    document.querySelectorAll('.nav-item').forEach(b => {
        const isActive = b.dataset.page === prev;
        b.classList.toggle('text-primary', isActive);
        b.classList.toggle('text-dark/30', !isActive);
    });

    window.scrollTo({ top: 0 });
    lucide.createIcons();
}

// ============================================================
// ONBOARDING
// ============================================================

function goOnboard() {
    const splash = document.getElementById('page-splash');
    splash.classList.add('opacity-0');
    setTimeout(() => {
        splash.classList.add('hidden');
        const ob = document.getElementById('page-onboarding');
        ob.classList.remove('hidden');
        ob.classList.add('active');
        S.page = 'onboarding';
    }, 500);
}

function setObSlide(i) {
    document.querySelectorAll('.ob-slide').forEach((s, idx) => {
        if (idx === i) {
            s.classList.remove('hidden');
            s.classList.add('flex');
        } else {
            s.classList.add('hidden');
            s.classList.remove('flex');
        }
    });
    document.querySelectorAll('#ob-dots div').forEach((d, idx) => {
        d.classList.toggle('bg-primary', idx === i);
        d.classList.toggle('w-6', idx === i);
        d.classList.toggle('bg-dark/10', idx !== i);
        d.classList.toggle('w-2', idx !== i);
    });
    const btn = document.getElementById('ob-next-btn');
    btn.textContent = i === 2 ? '🚀 Boshlash' : 'Davom etish →';
    S.obSlide = i;
}

document.getElementById('ob-next-btn')?.addEventListener('click', () => {
    if (S.obSlide < 2) setObSlide(S.obSlide + 1);
    else navigateTo('home');
});

document.getElementById('ob-skip-btn')?.addEventListener('click', () => {
    navigateTo('home');
});

// ============================================================
// РЕНДЕР ГЛАВНОЙ
// ============================================================

function renderHome() {
    renderCatsHome();
    renderPopular();
    renderSellers();
}

function renderCatsHome() {
    const el = document.getElementById('cats-home');
    if (!el) return;
    el.innerHTML = CATEGORIES.map((c, i) => `
        <button class="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all min-w-[80px] flex-shrink-0
                ${S.category === c.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-dark/5 text-dark/50'}"
                onclick="selectCat('${c.id}',this)">
            <span class="text-2xl">${c.emoji}</span>
            <span class="text-[10px] font-bold uppercase tracking-wider">${c.name}</span>
        </button>
    `).join('');
}

function selectCat(id, btn) {
    S.category = id;
    renderCatsHome();
    renderPopular();
}

function filteredProducts() {
    if (S.category === 'all')   return PRODUCTS;
    if (S.category === 'halol') return PRODUCTS.filter(p => p.halal);
    return PRODUCTS.filter(p => p.category === S.category);
}

function renderPopular() {
    const el = document.getElementById('popular-grid');
    if (!el) return;
    const list = filteredProducts().slice(0, 6);
    el.innerHTML = list.length
        ? list.map(productCard).join('')
        : `<div class="col-span-2 text-center py-12 text-dark/40">
               <div class="text-4xl mb-2">🔍</div>
               <p class="text-sm">Hech narsa topilmadi</p>
           </div>`;
}

function renderSellers() {
    const el = document.getElementById('sellers-list');
    if (!el) return;
    el.innerHTML = SELLERS.map(s => `
        <div class="flex-shrink-0 w-40 bg-white p-4 rounded-[2rem] border border-dark/5 shadow-sm active:scale-95 transition-transform">
            <div class="w-12 h-12 bg-accent/30 rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner">${s.emoji}</div>
            <div class="flex items-center gap-1 mb-1">
                <p class="font-bold text-dark text-[11px] truncate">${s.name}</p>
                ${s.verified ? '<i data-lucide="check-circle" class="w-3 h-3 text-primary"></i>' : ''}
            </div>
            <p class="text-[9px] text-dark/40 mb-3">${s.district}</p>
            <div class="flex items-center gap-1">
                <i data-lucide="star" class="w-3 h-3 text-yellow-400 fill-current"></i>
                <span class="text-[10px] font-bold text-dark">${s.rating}</span>
                <span class="text-[9px] text-dark/30">(${s.sales})</span>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// ============================================================
// КАРТОЧКА ТОВАРА
// ============================================================

function productCard(p) {
    return `
        <div class="bg-white rounded-[2rem] overflow-hidden border border-dark/5 shadow-sm active:scale-95 transition-transform" onclick="openProduct(${p.id})">
            <div class="h-36 flex items-center justify-center text-5xl bg-gradient-to-br ${p.bg}">
                ${p.emoji}
            </div>
            <div class="p-4">
                <p class="font-bold text-dark text-xs mb-1 line-clamp-2 h-8 leading-tight">${p.name}</p>
                <div class="flex items-center gap-1 mb-3">
                    <i data-lucide="star" class="w-3 h-3 text-yellow-400 fill-current"></i>
                    <span class="text-[10px] font-medium text-dark/50">${p.rating}</span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="font-bold text-primary text-sm">${fmtPrice(p.price)}</span>
                    <button class="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-transform" onclick="event.stopPropagation();quickAdd(${p.id})">
                        <i data-lucide="plus" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// КАТАЛОГ
// ============================================================

function renderCatalog() {
    const ft = document.getElementById('catalog-filters');
    if (ft) ft.innerHTML = CATEGORIES.map((c, i) => `
        <button class="flex-shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold border transition-all
                ${S.category === c.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-dark/5 text-dark/40'}"
                onclick="filterCat('${c.id}',this)">
            ${c.emoji} ${c.name}
        </button>
    `).join('');
    renderCatalogGrid();
}

function filterCat(id, btn) {
    S.category = id;
    renderCatalog();
}

function renderCatalogGrid() {
    const el = document.getElementById('catalog-grid');
    if (!el) return;
    el.innerHTML = filteredProducts().map(productCard).join('');
    lucide.createIcons();
}

// ============================================================
// СТРАНИЦА ТОВАРА
// ============================================================

function openProduct(id) {
    S.product = PRODUCTS.find(p => p.id === id);
    if (!S.product) return;
    S.qty    = 1;
    S.isFav  = false;
    navigateTo('product');
    renderProduct();
}

function renderProduct() {
    const p = S.product;
    const seller = SELLERS.find(s => s.id === p.seller_id);

    // Hero
    const hero = document.getElementById('product-hero');
    hero.className = `h-80 relative flex items-center justify-center text-9xl bg-gradient-to-br ${p.bg} overflow-hidden`;

    document.getElementById('product-emoji-big').textContent = p.emoji;
    document.getElementById('product-title').textContent     = p.name;
    document.getElementById('product-desc').textContent      = p.description;

    // Бейджи
    document.getElementById('product-badges').innerHTML = p.badges.map(b =>
        `<span class="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-lg">${b}</span>`
    ).join('');

    // Звёзды
    document.getElementById('product-stars').innerHTML = stars(p.rating);
    document.getElementById('product-rating-info').textContent =
        `${p.rating} · ${p.reviews_count} sharh`;

    // Продавец
    if (seller) {
        document.getElementById('seller-avatar').textContent   = seller.emoji;
        document.getElementById('seller-name').textContent     = seller.name;
        document.getElementById('seller-district').textContent = seller.district;
    }

    updateTotal();
    document.getElementById('qty-val').textContent = '1';

    // Избранное
    const favBtn = document.getElementById('fav-btn');
    const favIcon = document.getElementById('fav-icon');
    favIcon.classList.toggle('text-rose', S.isFav);
    favIcon.classList.toggle('fill-current', S.isFav);
    favIcon.classList.toggle('text-dark/30', !S.isFav);

    // Отзывы
    const revs = REVIEWS.filter(r => r.product_id === p.id);
    document.getElementById('product-reviews').innerHTML = revs.length
        ? revs.map(r => `
            <div class="bg-white p-5 rounded-3xl border border-dark/5 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">${r.avatar}</span>
                        <span class="font-bold text-dark text-sm">${r.author}</span>
                    </div>
                    <div class="flex text-yellow-400">${stars(r.rating)}</div>
                </div>
                <p class="text-dark/50 text-xs leading-relaxed mb-2">${r.text}</p>
                <p class="text-dark/20 text-[10px] font-medium">${r.date}</p>
            </div>
        `).join('')
        : `<p class="text-dark/30 text-sm italic text-center py-4">Hali sharhlar yo'q</p>`;
    
    lucide.createIcons();
}

function stars(rating) {
    return Array.from({length:5}, (_,i) =>
        `<i data-lucide="star" class="w-3 h-3 ${i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-dark/10'}"></i>`
    ).join('');
}

function changeQty(d) {
    S.qty = Math.max(1, Math.min(99, S.qty + d));
    document.getElementById('qty-val').textContent = S.qty;
    updateTotal();
}

function updateTotal() {
    if (!S.product) return;
    document.getElementById('product-total').textContent =
        fmtPrice(S.product.price * S.qty);
}

function toggleFavorite() {
    S.isFav = !S.isFav;
    const favIcon = document.getElementById('fav-icon');
    favIcon.classList.toggle('text-rose', S.isFav);
    favIcon.classList.toggle('fill-current', S.isFav);
    favIcon.classList.toggle('text-dark/30', !S.isFav);
    showToast(S.isFav ? '❤️ Sevimlilarga qo\'shildi' : 'Sevimlilardan olib tashlandi');
}

// ============================================================
// КОРЗИНА
// ============================================================

function addToCart() {
    if (!S.product) return;
    upsertCart(S.product.id, S.qty);
    showToast('✅ Savatga qo\'shildi!');
    goBack();
}

function quickAdd(id) {
    upsertCart(id, 1);
    showToast('✅ Savatga qo\'shildi!');
}

function upsertCart(id, qty) {
    const ex = S.cart.find(i => i.id === id);
    if (ex) ex.qty += qty;
    else S.cart.push({ id, qty });
    updateBadges();
}

function updateBadges() {
    const total = S.cart.reduce((s, i) => s + i.qty, 0);
    const show  = total > 0;

    const b1 = document.getElementById('nav-badge');
    const b2 = document.getElementById('header-cart-badge');

    [b1, b2].forEach(b => {
        if (!b) return;
        b.textContent     = total;
        if (show) {
            b.classList.remove('hidden');
            b.classList.add('flex');
        } else {
            b.classList.add('hidden');
            b.classList.remove('flex');
        }
    });
}

function renderCart() {
    const empty   = document.getElementById('cart-empty');
    const items   = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    const bar     = document.getElementById('cart-checkout-bar');

    if (!items) return;

    if (S.cart.length === 0) {
        empty.classList.remove('hidden');
        empty.classList.add('flex');
        items.innerHTML       = '';
        summary.classList.add('hidden');
        bar.style.display     = 'none';
        return;
    }

    empty.classList.add('hidden');
    empty.classList.remove('flex');
    summary.classList.remove('hidden');
    bar.style.display     = 'block';

    let sub = 0;

    items.innerHTML = S.cart.map(item => {
        const p = PRODUCTS.find(x => x.id === item.id);
        if (!p) return '';
        sub += p.price * item.qty;
        return `
            <div class="bg-white p-4 rounded-[2rem] border border-dark/5 shadow-sm flex items-center gap-4">
                <div class="w-20 h-20 rounded-2xl bg-gradient-to-br ${p.bg} flex items-center justify-center text-4xl shadow-inner flex-shrink-0">${p.emoji}</div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-dark text-sm truncate mb-1">${p.name}</p>
                    <p class="text-primary font-bold text-sm">${fmtPrice(p.price)}</p>
                </div>
                <div class="flex flex-col items-end gap-2">
                    <button onclick="removeCart(${p.id})" class="text-dark/20 p-1 active:scale-90"><i data-lucide="x" class="w-4 h-4"></i></button>
                    <div class="flex items-center gap-3 bg-accent/20 p-1.5 rounded-xl">
                        <button class="w-7 h-7 rounded-lg bg-white text-primary flex items-center justify-center text-sm font-bold shadow-sm active:scale-90" onclick="cartQty(${p.id},-1)">−</button>
                        <span class="font-bold text-dark text-sm min-w-[14px] text-center">${item.qty}</span>
                        <button class="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20 active:scale-90" onclick="cartQty(${p.id},1)">+</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('subtotal-val').textContent = fmtPrice(sub);
    document.getElementById('total-val').textContent    = fmtPrice(sub);
    lucide.createIcons();
}

function cartQty(id, d) {
    const item = S.cart.find(i => i.id === id);
    if (!item) return;
    item.qty += d;
    if (item.qty <= 0) removeCart(id);
    else { updateBadges(); renderCart(); }
}

function removeCart(id) {
    S.cart = S.cart.filter(i => i.id !== id);
    updateBadges();
    renderCart();
}

// ============================================================
// ПОИСК
// ============================================================

function handleSearch(q) {
    const el = document.getElementById('popular-grid');
    if (!el) return;
    const list = q
        ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
        : filteredProducts().slice(0, 6);

    el.innerHTML = list.length
        ? list.map(productCard).join('')
        : `<div class="col-span-2 text-center py-12 text-dark/40">
               <div class="text-4xl mb-2">🔍</div>
               <p class="text-sm">"${q}" topilmadi</p>
           </div>`;
    lucide.createIcons();
}

// ============================================================
// УТИЛИТЫ
// ============================================================

function fmtPrice(n) {
    return new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
}

let _toastTimer;
function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('opacity-0', 'pointer-events-none', '-translate-y-4');
    t.classList.add('opacity-100', 'translate-y-0');
    
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => {
        t.classList.add('opacity-0', 'pointer-events-none', '-translate-y-4');
        t.classList.remove('opacity-100', 'translate-y-0');
    }, 2500);
}

// ============================================================
// СТАРТ
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    setTimeout(goOnboard, 2200);
});