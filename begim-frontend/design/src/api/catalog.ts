// Begim Mini App — мост между общим слоем (@begim/shared) и view-моделью экранов.
// Маппит доменный Product бэкенда в локальный Product стора (string id, цена в сумах).

import { listProducts, getProduct, type Product as ApiProduct, type ProductListParams } from '@begim/shared';
import type { Product } from '../store/useStore';
import { PLACEHOLDER_IMAGE, PLACEHOLDER_AVATAR } from '../data/mock';

export function mapProduct(p: ApiProduct): Product {
  return {
    id: String(p.id),
    name: p.title,
    description: p.description,
    price: Math.round(p.price_minor / 100),
    imageUrl: p.photos?.[0]?.url ?? PLACEHOLDER_IMAGE,
    category: String(p.category_id),
    sellerName: p.seller_name ?? 'Sotuvchi',
    sellerAvatar: p.seller_avatar_url ?? PLACEHOLDER_AVATAR,
    rating: p.rating ?? 0,
    reviewsCount: p.reviews_count ?? 0,
    isHalol: p.tags?.includes('halal') ?? false,
    isNew: false,
  };
}

export async function fetchProducts(params?: ProductListParams): Promise<Product[]> {
  const page = await listProducts(params);
  return page.items.map(mapProduct);
}

export async function fetchProductById(id: number): Promise<Product> {
  return mapProduct(await getProduct(id));
}
