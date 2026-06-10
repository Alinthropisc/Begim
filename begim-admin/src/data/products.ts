export type Product = {
  id: string;
  name: string;
  nameUz: string;
  seller: string;
  sellerId: string;
  sellerAvatar: string;
  sellerCity: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  category: string;
  emoji: string;
  image: string;
  description: string;
  badges?: string[];
  halal?: boolean;
};

export type Category = {
  id: string;
  name: string;
  nameUz: string;
  emoji: string;
};

export type Story = {
  id: string;
  sellerId: string;
  seller: string;
  sellerAvatar: string;
  image: string;
  text?: string;
  createdAt: string;
  viewed?: boolean;
  productLink?: string;
};

export type CommunityPost = {
  id: string;
  sellerId: string;
  seller: string;
  sellerAvatar: string;
  sellerCity: string;
  image: string;
  text: string;
  likes: number;
  comments: number;
  createdAt: string;
  liked?: boolean;
  tags?: string[];
};

export const categories: Category[] = [
  { id: "all", name: "Все", nameUz: "Hammasi", emoji: "✨" },
  { id: "non", name: "Нон", nameUz: "Non", emoji: "🫓" },
  { id: "somsa", name: "Сомса", nameUz: "Somsa", emoji: "🥟" },
  { id: "tort", name: "Торты", nameUz: "Tortlar", emoji: "🎂" },
  { id: "shirinlik", name: "Сладости", nameUz: "Shirinliklar", emoji: "🍮" },
  { id: "cookie", name: "Печенье", nameUz: "Pechene", emoji: "🍪" },
  { id: "pishiriq", name: "Пироги", nameUz: "Pishiriqlar", emoji: "🥧" },
  { id: "bread", name: "Хлеб", nameUz: "Nonvoy", emoji: "🍞" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Самаркандский нон",
    nameUz: "Samarqand noni",
    seller: "Ойша апа",
    sellerId: "s1",
    sellerAvatar: "🌸",
    sellerCity: "Ташкент",
    price: 18000,
    rating: 4.9,
    reviewsCount: 124,
    category: "non",
    emoji: "🫓",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop",
    description: "Настоящий самаркандский нон, выпеченный в тандыре на углях. Хрустящая корочка и мягкий мякиш по рецепту бабушки.",
    badges: ["Хит", "Halol"],
    halal: true,
  },
  {
    id: "2",
    name: "Торт «Наполеон»",
    nameUz: "Napoleon torti",
    seller: "Малика опа",
    sellerId: "s2",
    sellerAvatar: "🌷",
    sellerCity: "Ташкент",
    price: 185000,
    oldPrice: 220000,
    rating: 5.0,
    reviewsCount: 89,
    category: "tort",
    emoji: "🎂",
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop",
    description: "Классический Наполеон с домашним заварным кремом. 12 слоёв тонкого теста. Идеален для тоев и праздников.",
    badges: ["−15%"],
    halal: true,
  },
  {
    id: "3",
    name: "Сомса с мясом",
    nameUz: "Go'shtli somsa",
    seller: "Дилноза",
    sellerId: "s3",
    sellerAvatar: "🌹",
    sellerCity: "Самарканд",
    price: 12000,
    rating: 4.8,
    reviewsCount: 256,
    category: "somsa",
    emoji: "🥟",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
    description: "Сочная слоёная сомса с говядиной и луком. Готовлю каждый день, только свежие ингредиенты. Минимальный заказ 5 шт.",
    badges: ["Хит"],
    halal: true,
  },
  {
    id: "4",
    name: "Пахлава медовая",
    nameUz: "Asalli paxlava",
    seller: "Нигора хоним",
    sellerId: "s4",
    sellerAvatar: "🌺",
    sellerCity: "Бухара",
    price: 95000,
    rating: 4.9,
    reviewsCount: 67,
    category: "shirinlik",
    emoji: "🍯",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&auto=format&fit=crop",
    description: "Бухарская пахлава с грецким орехом и натуральным горным мёдом. 24 слоя тонкого теста. Килограмм.",
    badges: ["Premium", "Halol"],
    halal: true,
  },
  {
    id: "5",
    name: "Чак-чак праздничный",
    nameUz: "Chak-chak",
    seller: "Зулфия апа",
    sellerId: "s5",
    sellerAvatar: "🌼",
    sellerCity: "Ташкент",
    price: 68000,
    rating: 4.7,
    reviewsCount: 43,
    category: "shirinlik",
    emoji: "🍬",
    image: "https://images.unsplash.com/photo-1606890658507-aeb36ef12344?w=800&auto=format&fit=crop",
    description: "Традиционный чак-чак на тоев и никах. Хрустящий, с карамельным сиропом. Упаковка 800г.",
    badges: ["Halol"],
    halal: true,
  },
  {
    id: "6",
    name: "Курабье домашнее",
    nameUz: "Uy qurabyesi",
    seller: "Феруза",
    sellerId: "s6",
    sellerAvatar: "🌻",
    sellerCity: "Фергана",
    price: 42000,
    rating: 4.8,
    reviewsCount: 78,
    category: "cookie",
    emoji: "🍪",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop",
    description: "Нежное рассыпчатое курабье с капелькой джема. Коробка 500г, около 25 штук. Без консервантов.",
    halal: true,
  },
  {
    id: "7",
    name: "Самса с тыквой",
    nameUz: "Oshqovoqli somsa",
    seller: "Дилноза",
    sellerId: "s3",
    sellerAvatar: "🌹",
    sellerCity: "Самарканд",
    price: 10000,
    rating: 4.7,
    reviewsCount: 134,
    category: "somsa",
    emoji: "🥟",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop",
    description: "Сезонная сомса со сладкой тыквой и специями. Тонкое хрустящее тесто. Минимум 5 шт.",
    badges: ["Сезон"],
    halal: true,
  },
  {
    id: "8",
    name: "Торт «Медовик»",
    nameUz: "Asalli tort",
    seller: "Малика опа",
    sellerId: "s2",
    sellerAvatar: "🌷",
    sellerCity: "Ташкент",
    price: 165000,
    rating: 4.9,
    reviewsCount: 102,
    category: "tort",
    emoji: "🍰",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
    description: "Медовые коржи с нежным сметанным кремом. Вес 1.5 кг. Украшение на заказ возможно.",
    badges: ["Halol"],
    halal: true,
  },
  {
    id: "9",
    name: "Нон тандырный",
    nameUz: "Tandir non",
    seller: "Ойша апа",
    sellerId: "s1",
    sellerAvatar: "🌸",
    sellerCity: "Ташкент",
    price: 15000,
    rating: 4.9,
    reviewsCount: 312,
    category: "bread",
    emoji: "🍞",
    image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop",
    description: "Классический тандырный нон на каждый день. Свежий, ароматный, с кунжутом.",
    badges: ["Хит", "Halol"],
    halal: true,
  },
  {
    id: "10",
    name: "Пирог с вишней",
    nameUz: "Olcha pirogi",
    seller: "Феруза",
    sellerId: "s6",
    sellerAvatar: "🌻",
    sellerCity: "Фергана",
    price: 55000,
    rating: 4.8,
    reviewsCount: 51,
    category: "pishiriq",
    emoji: "🥧",
    image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800&auto=format&fit=crop",
    description: "Открытый песочный пирог со свежей вишней. Размер 24 см, 8 порций.",
    halal: true,
  },
  {
    id: "11",
    name: "Печенье ореховое",
    nameUz: "Yong'oqli pechene",
    seller: "Нигора хоним",
    sellerId: "s4",
    sellerAvatar: "🌺",
    sellerCity: "Бухара",
    price: 38000,
    rating: 4.9,
    reviewsCount: 88,
    category: "cookie",
    emoji: "🍪",
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop",
    description: "Хрустящее печенье с грецким орехом и корицей. Коробка 400г.",
    badges: ["Halol"],
    halal: true,
  },
  {
    id: "12",
    name: "Халва подсолнечная",
    nameUz: "Kungaboqar halvosi",
    seller: "Зулфия апа",
    sellerId: "s5",
    sellerAvatar: "🌼",
    sellerCity: "Ташкент",
    price: 48000,
    rating: 4.6,
    reviewsCount: 39,
    category: "shirinlik",
    emoji: "🌻",
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&auto=format&fit=crop",
    description: "Домашняя халва из отборных семечек. Тает во рту. Упаковка 500г.",
    halal: true,
  },
];

export const stories: Story[] = [
  {
    id: "st1",
    sellerId: "s1",
    seller: "Ойша апа",
    sellerAvatar: "🌸",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop",
    text: "Bugun tandirda yangi non! 🔥",
    createdAt: "2 soat oldin",
    productLink: "1",
  },
  {
    id: "st2",
    sellerId: "s2",
    seller: "Малика опа",
    sellerAvatar: "🌷",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop",
    text: "To'y uchun maxsus tort 🎂",
    createdAt: "4 soat oldin",
    productLink: "8",
  },
  {
    id: "st3",
    sellerId: "s3",
    seller: "Дилноза",
    sellerAvatar: "🌹",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop",
    text: "Yangi somsa tayyor! 🥟",
    createdAt: "5 soat oldin",
    productLink: "3",
  },
  {
    id: "st4",
    sellerId: "s4",
    seller: "Нигора хоним",
    sellerAvatar: "🌺",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&auto=format&fit=crop",
    text: "Buxoro paxlavasi ✨",
    createdAt: "6 soat oldin",
    productLink: "4",
  },
  {
    id: "st5",
    sellerId: "s5",
    seller: "Зулфия апа",
    sellerAvatar: "🌼",
    image: "https://images.unsplash.com/photo-1606890658507-aeb36ef12344?w=800&auto=format&fit=crop",
    text: "To'y chak-chak! 🍬",
    createdAt: "8 soat oldin",
    productLink: "5",
  },
  {
    id: "st6",
    sellerId: "s6",
    seller: "Феруза",
    sellerAvatar: "🌻",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop",
    text: "Yangi qurabye 🍪",
    createdAt: "10 soat oldin",
    productLink: "6",
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: "p1",
    sellerId: "s2",
    seller: "Малика опа",
    sellerAvatar: "🌷",
    sellerCity: "Ташкент",
    image: "https://images.unsplash.com/photo-1562440499-64c9a111f713?w=1200&auto=format&fit=crop",
    text: "Bugun juda chiroyli tort tayyorladim! 🎂 Qizaloqning 5 yosh to'yiga. Onasi yig'lab yubordi xursandlikdan. Shunday lahzalar uchun ishlaymiz 💕",
    likes: 124,
    comments: 18,
    createdAt: "3 soat oldin",
    tags: ["tort", "to'y", "baxtli_mijoz"],
  },
  {
    id: "p2",
    sellerId: "s3",
    seller: "Дилноза",
    sellerAvatar: "🌹",
    sellerCity: "Самарканд",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&auto=format&fit=crop",
    text: "Somsaning sirini so'rashadi. Eng muhimi — sevgi bilan tayyorlash 🤲 Va albatta sifatli go'sht. Hech qachon arzon mahsulot ishlatmanglar, opa-singillar! ✨",
    likes: 287,
    comments: 42,
    createdAt: "5 soat oldin",
    tags: ["maslahat", "somsa", "sifat"],
  },
  {
    id: "p3",
    sellerId: "s4",
    seller: "Нигора хоним",
    sellerAvatar: "🌺",
    sellerCity: "Бухара",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1200&auto=format&fit=crop",
    text: "Buxoro paxlavasi — bu san'at! 🎨 24 qatlam, har biri qo'lda yoyiladi. Sabr va mahorat kerak. Lekin natijaga arziydi 😊",
    likes: 198,
    comments: 27,
    createdAt: "8 soat oldin",
    tags: ["paxlava", "buxoro", "an'ana"],
  },
  {
    id: "p4",
    sellerId: "s1",
    seller: "Ойша апа",
    sellerAvatar: "🌸",
    sellerCity: "Ташкент",
    image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1200&auto=format&fit=crop",
    text: "Tandir non — bu mening hayotim. 40 yildan beri har kuni ertalab soat 4 da turib non yopaman. Farzandlarim ham o'rganyapti endi. Alhamdulillah 🤲",
    likes: 412,
    comments: 56,
    createdAt: "12 soat oldin",
    tags: ["non", "tandir", "an'ana"],
  },
  {
    id: "p5",
    sellerId: "s5",
    seller: "Зулфия апа",
    sellerAvatar: "🌼",
    sellerCity: "Ташкент",
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=1200&auto=format&fit=crop",
    text: "Yangi retsept sinab ko'rdim! 🧪 Chak-chakga biroz limon qo'shdim — juda mazali bo'ldi. Kim sinab ko'rmoqchi? Retsept bilan o'rtoqlashaman 😊",
    likes: 156,
    comments: 31,
    createdAt: "1 kun oldin",
    tags: ["retsept", "chak-chak", "yangilik"],
  },
];

export type Review = {
  id: string;
  productId: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
};

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    author: "Шахло",
    avatar: "🌸",
    rating: 5,
    date: "2 kun oldin",
    text: "Juda mazali non! Samarqanddagi buvimnikidek. Bolalar xursand, har hafta buyurtma beramiz. Rahmat, Oisha apa! 🤲",
  },
  {
    id: "r2",
    productId: "1",
    author: "Наргиза",
    avatar: "🌷",
    rating: 5,
    date: "1 hafta oldin",
    text: "Nonushtaga buyurtma berdim — issiq holda olib kelishdi. Allah baraka bersin! 👏",
  },
  {
    id: "r3",
    productId: "1",
    author: "Мадина",
    avatar: "🌹",
    rating: 4,
    date: "2 hafta oldin",
    text: "Yaxshi non, lekin kunjut ko'proq bo'lsa yaxshi bo'lardi. Qolgani — super!",
  },
  {
    id: "r4",
    productId: "2",
    author: "Азиза",
    avatar: "🌺",
    rating: 5,
    date: "3 kun oldin",
    text: "Qizimning tug'ilgan kuniga buyurtma berdim — barcha mehmonlar hayratda qoldi! Krem juda mazali, shirin emas. Yana olaman 🎂",
  },
  {
    id: "r5",
    productId: "3",
    author: "Дильноза",
    avatar: "🌼",
    rating: 5,
    date: "kecha",
    text: "Somsa — zo'r! 🔥 Go'sht sersuv, qatlam-qatlam. Shahardagi eng yaxshisi, jiddiy.",
  },
];

export const formatPrice = (n: number) =>
  n.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm";
