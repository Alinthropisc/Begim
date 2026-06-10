export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  sellerName: string;
  sellerAvatar: string;
  rating: number;
  reviewsCount: number;
  isHalol?: boolean;
  isNew?: boolean;
}

export interface Story {
  id: string;
  sellerName: string;
  sellerAvatar: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar: string;
  title: string;
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  timeAgo: string;
}

export const categories: Category[] = [
  { id: "all", name: "Hammasi", icon: "🍽️" },
  { id: "cakes", name: "Tortlar", icon: "🎂" },
  { id: "cookies", name: "Pechenyelar", icon: "🍪" },
  { id: "pastries", name: "Bulochkalar", icon: "🥐" },
  { id: "sweets", name: "Shirinliklar", icon: "🍬" },
  { id: "bread", name: "Non", icon: "🍞" },
  { id: "desserts", name: "Desertlar", icon: "🍰" },
];

export const products: Product[] = [
  {
    id: "1",
    name: "Medovik torti",
    description:
      "Klassik medovik — asal bilan pishirilgan nozik qatlamlar va qaymoqli krem. Oilaviy retsept bo'yicha tayyorlanadi.",
    price: 180000,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    category: "cakes",
    sellerName: "Dilnoza opa",
    sellerAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    rating: 4.9,
    reviewsCount: 128,
    isHalol: true,
  },
  {
    id: "2",
    name: "Chak-chak",
    description:
      "Milliy shirinlik — asal bilan shakllangan qizartirilgan xamir bo'laklari.",
    price: 95000,
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
    category: "sweets",
    sellerName: "Gulnora xola",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    rating: 4.8,
    reviewsCount: 96,
    isHalol: true,
    isNew: true,
  },
  {
    id: "3",
    name: "Samsa go'shtli",
    description:
      "To'ndirda pishirilgan go'shtli samsa. Qo'y go'shti va piyoz bilan.",
    price: 15000,
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
    category: "pastries",
    sellerName: "Zulfiya opa",
    sellerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    rating: 4.9,
    reviewsCount: 245,
    isHalol: true,
  },
  {
    id: "4",
    name: "Paxlava",
    description:
      "Yong'oq va asal bilan to'ldirilgan qatlamali sharqona shirinlik.",
    price: 120000,
    imageUrl:
      "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
    category: "sweets",
    sellerName: "Malika",
    sellerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    rating: 5.0,
    reviewsCount: 67,
    isHalol: true,
  },
  {
    id: "5",
    name: "Shokoladli pechenye",
    description:
      "Frantsuz retsepti bo'yicha tayyorlangan shokolad bo'laklari bilan pechenye.",
    price: 45000,
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
    category: "cookies",
    sellerName: "Anora",
    sellerAvatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
    rating: 4.7,
    reviewsCount: 54,
    isHalol: true,
    isNew: true,
  },
  {
    id: "6",
    name: "Napoleon torti",
    description:
      "Klassik Napoleon — ming qatlamli xamir va qaymoqli krem.",
    price: 220000,
    imageUrl:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&q=80",
    category: "cakes",
    sellerName: "Dilnoza opa",
    sellerAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    rating: 4.9,
    reviewsCount: 89,
    isHalol: true,
  },
];

export const stories: Story[] = [
  {
    id: "1",
    sellerName: "Yangi",
    sellerAvatar: "",
    imageUrl: "",
  },
  {
    id: "2",
    sellerName: "Dilnoza",
    sellerAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
  },
  {
    id: "3",
    sellerName: "Gulnora",
    sellerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80",
  },
  {
    id: "4",
    sellerName: "Malika",
    sellerAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
  },
  {
    id: "5",
    sellerName: "Anora",
    sellerAvatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80",
  },
  {
    id: "6",
    sellerName: "Zulfiya",
    sellerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
  },
];

export const posts: Post[] = [
  {
    id: "1",
    authorName: "Dilnoza opa",
    authorAvatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    title: "Medovik sirlari 🍯",
    content:
      "Ko'pchilik so'raydi — nega mening medovik shunchalik yumshoq? Sirri asalda va qaymoqning nisbatida...",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
    likesCount: 124,
    commentsCount: 32,
    timeAgo: "2 soat oldin",
  },
  {
    id: "2",
    authorName: "Malika",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    title: "Paxlava tayyorlash usuli ✨",
    content:
      "Sharqona paxlava — bu san'at! Har bir qatlam sevgi bilan qo'yiladi.",
    imageUrl:
      "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80",
    likesCount: 89,
    commentsCount: 21,
    timeAgo: "5 soat oldin",
  },
];

export const formatPrice = (price: number): string => {
  return (
    price.toLocaleString("ru-RU").replace(/,/g, " ") + " so'm"
  );
};
