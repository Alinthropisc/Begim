export type Seller = {
  id: string;
  name: string;
  avatar: string;
  city: string;
  bio: string;
  speciality: string;
  since: string;
  rating: number;
  reviewsCount: number;
  productsCount: number;
  ordersCount: number;
  verified: boolean;
  halal: boolean;
  telegram?: string;
  badge?: string;
};

export const sellers: Seller[] = [
  {
    id: "s1",
    name: "Ойша апа",
    avatar: "🌸",
    city: "Toshkent",
    bio: "25 yildan beri non pishiraman. Samarqand resepti — buvimdan meros. Har bir non qalbim bilan pishiriladi.",
    speciality: "Samarqand noni, Tandirda pishirilgan",
    since: "2021",
    rating: 4.9,
    reviewsCount: 124,
    productsCount: 8,
    ordersCount: 1240,
    verified: true,
    halal: true,
    telegram: "@oysha_non",
    badge: "Top Sotuvchi",
  },
  {
    id: "s2",
    name: "Малика опа",
    avatar: "🌷",
    city: "Toshkent",
    bio: "Konditer bo'lib ishlagan. Hozir uyda Premium tortlar yasayman. Har bir tort — san'at asari.",
    speciality: "Premium tortlar, Fransuz taomi",
    since: "2020",
    rating: 5.0,
    reviewsCount: 89,
    productsCount: 12,
    ordersCount: 890,
    verified: true,
    halal: true,
    telegram: "@malika_cakes",
    badge: "5★ Sotuvchi",
  },
  {
    id: "s3",
    name: "Дилноза",
    avatar: "🌹",
    city: "Samarqand",
    bio: "Samarqand somsa ustasi. 10 yillik tajriba. Tandirda pishirilgan, go'sht sersuv, qatlam-qatlam.",
    speciality: "Somsa, Tandir mahsulotlari",
    since: "2022",
    rating: 4.8,
    reviewsCount: 256,
    productsCount: 5,
    ordersCount: 2560,
    verified: true,
    halal: true,
    telegram: "@dilnoza_somsa",
    badge: "Mashhur",
  },
  {
    id: "s4",
    name: "Нигора хоним",
    avatar: "🌺",
    city: "Buxoro",
    bio: "Buxoro milliy shirinliklarini yasayman. Paxlava, chak-chak, halva — barcha halol ingredientlar.",
    speciality: "Milliy shirinliklar, Paxlava",
    since: "2021",
    rating: 4.9,
    reviewsCount: 67,
    productsCount: 9,
    ordersCount: 670,
    verified: true,
    halal: true,
    telegram: "@nigora_sweets",
  },
  {
    id: "s5",
    name: "Зулфия апа",
    avatar: "🌼",
    city: "Toshkent",
    bio: "Uyda pishirilgan bulochkalar va kekslar. Bolalar uchun sog'lom, tabiiy ingredientlar.",
    speciality: "Bulochkalar, Kekslar",
    since: "2023",
    rating: 4.7,
    reviewsCount: 43,
    productsCount: 6,
    ordersCount: 430,
    verified: false,
    halal: true,
  },
];

export const getSellerById = (id: string) => sellers.find((s) => s.id === id);
