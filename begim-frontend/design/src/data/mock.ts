// Begim Mini App — мок-данные. Используются как graceful fallback, когда
// бэкенд недоступен (офлайн-демо, разработка без поднятого API).
// Боевые данные приходят через общий слой @begim/shared.

import type { Product } from '../store/useStore';

export const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80';
export const PLACEHOLDER_AVATAR =
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Medovik torti',
    description: 'Klassik medovik — asal bilan pishirilgan nozik qatlamlar',
    price: 180000,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80',
    category: 'cakes',
    sellerName: 'Dilnoza opa',
    sellerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    rating: 4.9,
    reviewsCount: 128,
    isHalol: true,
  },
  {
    id: '2',
    name: 'Chak-chak',
    description: 'Milliy shirinlik — asal bilan shakllangan qizartirilgan xamir',
    price: 95000,
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    category: 'sweets',
    sellerName: 'Gulnora xola',
    sellerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
    rating: 4.8,
    reviewsCount: 96,
    isHalol: true,
    isNew: true,
  },
  {
    id: '3',
    name: "Samsa go'shtli",
    description: "To'ndirda pishirilgan go'shtli samsa",
    price: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    category: 'pastries',
    sellerName: 'Zulfiya opa',
    sellerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
    rating: 4.9,
    reviewsCount: 245,
    isHalol: true,
  },
  {
    id: '4',
    name: 'Paxlava',
    description: "Yong'oq va asal bilan to'ldirilgan qatlamali shirinlik",
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=800&q=80',
    category: 'sweets',
    sellerName: 'Malika',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    rating: 5.0,
    reviewsCount: 67,
    isHalol: true,
  },
];

export const mockStories = [
  { id: '1', name: 'Yangi', avatar: '', isAdd: true },
  { id: '2', name: 'Dilnoza', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id: '3', name: 'Gulnora', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80' },
  { id: '4', name: 'Malika', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80' },
  { id: '5', name: 'Anora', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80' },
];

export const categories = [
  { id: 'all', name: 'Hammasi', icon: '🍽️' },
  { id: 'cakes', name: 'Tortlar', icon: '🎂' },
  { id: 'cookies', name: 'Pechenyelar', icon: '🍪' },
  { id: 'pastries', name: 'Bulochkalar', icon: '🥐' },
  { id: 'sweets', name: 'Shirinliklar', icon: '🍬' },
];
