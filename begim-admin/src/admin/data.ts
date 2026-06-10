// ═══════════════════════════════════════════════════
//  Мок-данные для админ-панели Begim
// ═══════════════════════════════════════════════════

export type AdminOrder = {
  id: string;
  customer: string;
  customerAvatar: string;
  seller: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "new" | "processing" | "delivering" | "delivered" | "cancelled";
  city: string;
  createdAt: string;
  paymentMethod: "cash" | "card" | "telegram";
};

export type AdminSeller = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  phone: string;
  telegram?: string;
  category: string;
  status: "active" | "pending" | "blocked";
  rating: number;
  totalSales: number;
  productsCount: number;
  joinedAt: string;
  verified: boolean;
  halal: boolean;
};

export type AdminReview = {
  id: string;
  product: string;
  productId: string;
  author: string;
  authorAvatar: string;
  rating: number;
  text: string;
  date: string;
  status: "approved" | "pending" | "rejected";
  reported: boolean;
};

export type AdminCommunityPost = {
  id: string;
  seller: string;
  sellerAvatar: string;
  text: string;
  image: string;
  likes: number;
  comments: number;
  reported: number;
  status: "approved" | "pending" | "rejected";
  createdAt: string;
};

export const adminOrders: AdminOrder[] = [
  {
    id: "#BGM-1024",
    customer: "Шахло М.",
    customerAvatar: "🌸",
    seller: "Ойша апа",
    items: [
      { name: "Самаркандский нон", qty: 2, price: 18000 },
      { name: "Нон тандырный", qty: 1, price: 15000 },
    ],
    total: 51000,
    status: "new",
    city: "Ташкент",
    createdAt: "5 минут назад",
    paymentMethod: "telegram",
  },
  {
    id: "#BGM-1023",
    customer: "Азиза Р.",
    customerAvatar: "🌺",
    seller: "Малика опа",
    items: [{ name: "Торт «Наполеон»", qty: 1, price: 185000 }],
    total: 185000,
    status: "processing",
    city: "Ташкент",
    createdAt: "23 минуты назад",
    paymentMethod: "card",
  },
  {
    id: "#BGM-1022",
    customer: "Дильноза К.",
    customerAvatar: "🌼",
    seller: "Дилноза",
    items: [{ name: "Сомса с мясом", qty: 10, price: 12000 }],
    total: 120000,
    status: "delivering",
    city: "Самарканд",
    createdAt: "1 час назад",
    paymentMethod: "cash",
  },
  {
    id: "#BGM-1021",
    customer: "Наргиза Т.",
    customerAvatar: "🌷",
    seller: "Нигора хоним",
    items: [{ name: "Пахлава медовая", qty: 2, price: 95000 }],
    total: 190000,
    status: "delivered",
    city: "Бухара",
    createdAt: "3 часа назад",
    paymentMethod: "telegram",
  },
  {
    id: "#BGM-1020",
    customer: "Мадина С.",
    customerAvatar: "🌹",
    seller: "Зулфия апа",
    items: [{ name: "Чак-чак праздничный", qty: 1, price: 68000 }],
    total: 68000,
    status: "delivered",
    city: "Ташкент",
    createdAt: "5 часов назад",
    paymentMethod: "card",
  },
  {
    id: "#BGM-1019",
    customer: "Феруза А.",
    customerAvatar: "🌻",
    seller: "Феруза",
    items: [{ name: "Курабье домашнее", qty: 3, price: 42000 }],
    total: 126000,
    status: "cancelled",
    city: "Фергана",
    createdAt: "8 часов назад",
    paymentMethod: "cash",
  },
  {
    id: "#BGM-1018",
    customer: "Малика Ю.",
    customerAvatar: "🌸",
    seller: "Малика опа",
    items: [{ name: "Торт «Медовик»", qty: 1, price: 165000 }],
    total: 165000,
    status: "delivered",
    city: "Ташкент",
    createdAt: "вчера",
    paymentMethod: "telegram",
  },
];

export const adminSellers: AdminSeller[] = [
  { id:"s1", name:"Ойша апа",        avatar:"🌸", city:"Ташкент",  phone:"+998 90 123 45 67", telegram:"oysha_apa",    category:"Нон / Хлеб", status:"active",  rating:4.9, totalSales:142, productsCount:5, joinedAt:"3 месяца назад",  verified:true,  halal:true  },
  { id:"s2", name:"Малика опа",       avatar:"🌷", city:"Ташкент",  phone:"+998 91 234 56 78", telegram:"malika_opa",   category:"Торты",      status:"active",  rating:5.0, totalSales:89,  productsCount:8, joinedAt:"6 месяцев назад", verified:true,  halal:true  },
  { id:"s3", name:"Дилноза",          avatar:"🌹", city:"Самарканд",phone:"+998 93 345 67 89", telegram:"dilnoza_cake", category:"Сомса",      status:"active",  rating:4.8, totalSales:256, productsCount:4, joinedAt:"1 год назад",      verified:true,  halal:true  },
  { id:"s4", name:"Нигора хоним",     avatar:"🌺", city:"Бухара",   phone:"+998 94 456 78 90", telegram:"nigora_buxoro",category:"Сладости",   status:"active",  rating:4.9, totalSales:67,  productsCount:6, joinedAt:"4 месяца назад",  verified:true,  halal:true  },
  { id:"s7", name:"Сарвиноз",         avatar:"🌼", city:"Наманган", phone:"+998 95 567 89 01", telegram:"sarvinoz_nm",  category:"Торты",      status:"pending", rating:0,   totalSales:0,   productsCount:3, joinedAt:"2 дня назад",      verified:false, halal:true  },
  { id:"s8", name:"Гулноза",          avatar:"🌸", city:"Андижан",  phone:"+998 97 678 90 12",                          category:"Печенье",    status:"pending", rating:0,   totalSales:0,   productsCount:5, joinedAt:"вчера",             verified:false, halal:false },
  { id:"s9", name:"Шахло (проблема)", avatar:"⚠️", city:"Ташкент",  phone:"+998 90 999 00 11",                          category:"Торты",      status:"blocked", rating:2.1, totalSales:12,  productsCount:2, joinedAt:"2 месяца назад",   verified:false, halal:false },
];

export const adminReviews: AdminReview[] = [
  {
    id: "rv1",
    product: "Самаркандский нон",
    productId: "1",
    author: "Шахло",
    authorAvatar: "🌸",
    rating: 5,
    text: "Juda mazali non! Samarqanddagi buvimnikidek. Bolalar xursand!",
    date: "2 часа назад",
    status: "pending",
    reported: false,
  },
  {
    id: "rv2",
    product: "Торт «Наполеон»",
    productId: "2",
    author: "Азиза",
    authorAvatar: "🌺",
    rating: 5,
    text: "Qizimning tug'ilgan kuniga buyurtma berdim — barcha mehmonlar hayratda qoldi!",
    date: "3 часа назад",
    status: "approved",
    reported: false,
  },
  {
    id: "rv3",
    product: "Сомса с мясом",
    productId: "3",
    author: "Аноним",
    authorAvatar: "⚠️",
    rating: 1,
    text: "Это спам сообщение с рекламой другого магазина. Купите у нас дешевле!",
    date: "5 часов назад",
    status: "pending",
    reported: true,
  },
  {
    id: "rv4",
    product: "Пахлава медовая",
    productId: "4",
    author: "Мадина",
    authorAvatar: "🌹",
    rating: 4,
    text: "Yaxshi paxlava, lekin biroz shirin. Qolgani zo'r!",
    date: "вчера",
    status: "approved",
    reported: false,
  },
];

export const adminCommunityPosts: AdminCommunityPost[] = [
  {
    id: "cp1",
    seller: "Малика опа",
    sellerAvatar: "🌷",
    text: "Bugun juda chiroyli tort tayyorladim! 🎂 Qizaloqning 5 yosh to'yiga...",
    image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=400",
    likes: 124,
    comments: 18,
    reported: 0,
    status: "approved",
    createdAt: "3 часа назад",
  },
  {
    id: "cp2",
    seller: "Спаммер",
    sellerAvatar: "⚠️",
    text: "КУПИТЕ У НАС ДЕШЕВЛЕ!!! Переходите по ссылке...",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400",
    likes: 0,
    comments: 0,
    reported: 7,
    status: "pending",
    createdAt: "1 час назад",
  },
  {
    id: "cp3",
    seller: "Дилноза",
    sellerAvatar: "🌹",
    text: "Somsaning sirini so'rashadi. Eng muhimi — sevgi bilan tayyorlash 🤲",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    likes: 287,
    comments: 42,
    reported: 0,
    status: "approved",
    createdAt: "5 часов назад",
  },
];

// Статистика для Dashboard
export const adminStats = {
  todayOrders: 24,
  todayOrdersDelta: 12,
  todayRevenue: 2_450_000,
  todayRevenueDelta: 8,
  activeSellers: 127,
  activeSellersDelta: 3,
  totalUsers: 4_892,
  totalUsersDelta: 156,
  pendingReviews: 8,
  pendingSellers: 2,
  reportedPosts: 3,
  conversionRate: 4.2,
};

export type PeriodKey = "today" | "week" | "month";

export const periodStats: Record<PeriodKey, {
  orders: number; ordersDelta: number;
  revenue: number; revenueDelta: number;
  newUsers: number; newUsersDelta: number;
  conversion: number;
}> = {
  today: { orders:24,   ordersDelta:12,  revenue:2_450_000,  revenueDelta:8,   newUsers:156, newUsersDelta:23,  conversion:4.2 },
  week:  { orders:168,  ordersDelta:18,  revenue:13_400_000, revenueDelta:15,  newUsers:892, newUsersDelta:11,  conversion:4.8 },
  month: { orders:712,  ordersDelta:22,  revenue:54_200_000, revenueDelta:19,  newUsers:3240,newUsersDelta:8,   conversion:5.1 },
};

export const chartData: Record<PeriodKey, { day: string; value: number }[]> = {
  today: [
    { day:"08:00", value:180000 }, { day:"10:00", value:320000 }, { day:"12:00", value:540000 },
    { day:"14:00", value:410000 }, { day:"16:00", value:390000 }, { day:"18:00", value:610000 },
    { day:"20:00", value:450000 },
  ],
  week: [
    { day:"Дш", value:1200000 }, { day:"Сш", value:1450000 }, { day:"Чш", value:1800000 },
    { day:"Пш", value:1600000 }, { day:"Жм", value:2100000 }, { day:"Сб", value:2800000 },
    { day:"Як", value:2450000 },
  ],
  month: [
    { day:"1-хаф", value:11200000 }, { day:"2-хаф", value:13800000 },
    { day:"3-хаф", value:15400000 }, { day:"4-хаф", value:13800000 },
  ],
};

// Продажи за неделю (для графика — устаревший экспорт, используем chartData)
export const weeklySales = chartData.week;

// Топ городов
export const topCities = [
  { city: "Ташкент", orders: 1240, percent: 48 },
  { city: "Самарканд", orders: 520, percent: 20 },
  { city: "Бухара", orders: 310, percent: 12 },
  { city: "Фергана", orders: 230, percent: 9 },
  { city: "Наманган", orders: 180, percent: 7 },
  { city: "Другие", orders: 100, percent: 4 },
];

// Топ товаров
export const topProducts = [
  { name: "Сомса с мясом", seller: "Дилноза", sales: 256, revenue: 3_072_000, emoji: "🥟" },
  { name: "Нон тандырный", seller: "Ойша апа", sales: 312, revenue: 4_680_000, emoji: "🍞" },
  { name: "Торт «Наполеон»", seller: "Малика опа", sales: 89, revenue: 16_465_000, emoji: "🎂" },
  { name: "Пахлава медовая", seller: "Нигора хоним", sales: 67, revenue: 6_365_000, emoji: "🍯" },
  { name: "Самаркандский нон", seller: "Ойша апа", sales: 124, revenue: 2_232_000, emoji: "🫓" },
];

export const formatPrice = (n: number) =>
  n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";

export const formatShortPrice = (n: number) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toString();
};

export const statusLabels: Record<AdminOrder["status"], { label: string; color: string }> = {
  new: { label: "Янги", color: "bg-blue-100 text-blue-700 border-blue-200" },
  processing: { label: "Тайёрланмоқда", color: "bg-amber-100 text-amber-700 border-amber-200" },
  delivering: { label: "Йўлда", color: "bg-purple-100 text-purple-700 border-purple-200" },
  delivered: { label: "Етказилди", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Бекор", color: "bg-red-100 text-red-700 border-red-200" },
};

export const sellerStatusLabels: Record<AdminSeller["status"], { label: string; color: string }> = {
  active: { label: "Фаол", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  pending: { label: "Кутилмоқда", color: "bg-amber-100 text-amber-700 border-amber-200" },
  blocked: { label: "Блокланган", color: "bg-red-100 text-red-700 border-red-200" },
};

export const reviewStatusLabels: Record<AdminReview["status"], { label: string; color: string }> = {
  approved: { label: "Тасдиқланган", color: "bg-emerald-100 text-emerald-700" },
  pending: { label: "Кутилмоқда", color: "bg-amber-100 text-amber-700" },
  rejected: { label: "Рад этилган", color: "bg-red-100 text-red-700" },
};
