// Begim — общие доменные типы.
// Источник истины — begim-backend/API.md и API_DOCS.Domain.md.
// Деньги везде целые *_minor (тийины UZS), время — ISO-8601 UTC.

export type Role = 'customer' | 'seller' | 'admin';
export type Locale = 'uz' | 'ru';

export interface AuthUser {
  id: number;
  tg_id: number;
  role: Role;
  locale: Locale;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export interface City {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children?: Category[];
}

export interface ProductPhoto {
  id: number;
  url: string;
  position: number;
}

export type ProductStatus = 'draft' | 'published' | 'archived' | 'blocked';

export interface Product {
  id: number;
  title: string;
  description: string;
  price_minor: number;
  currency: string;
  status: ProductStatus;
  /** Метки товара (напр. "halal", "custom", "vegan"). */
  tags?: string[];
  category_id: number | null;
  city_id: number | null;
  seller_id: number;
  /** Денормализованные поля — есть не во всех ответах (например, листинг их не отдаёт). */
  seller_name?: string;
  seller_avatar_url?: string | null;
  rating?: number;
  reviews_count?: number;
  photos: ProductPhoto[];
  published_at?: string | null;
  created_at?: string;
}

export interface Seller {
  id: number;
  slug: string;
  brand_name: string;
  bio?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  city_id: number;
  verification: 'pending' | 'verified' | 'rejected';
  followers_count?: number;
  products_count?: number;
  rating?: number;
}

export interface Story {
  id: number;
  seller_id: number;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string | null;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
}

export interface Recipe {
  id: number;
  title: string;
  cover_url?: string | null;
  summary?: string | null;
  steps?: string[];
  ingredients?: string[];
  author_name?: string;
  likes_count?: number;
  saved?: boolean;
  liked?: boolean;
  created_at: string;
}

export interface CommunityPost {
  id: number;
  author_name: string;
  author_avatar_url?: string | null;
  body: string;
  media?: string[];
  likes_count: number;
  comments_count: number;
  liked?: boolean;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'delivering'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  product_id: number;
  title: string;
  price_minor: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  items: OrderItem[];
  total_minor: number;
  delivery_address?: string | null;
  buyer_id: number;
  seller_id: number;
  created_at: string;
}

export interface CreateOrderItem {
  product_id: number;
  quantity: number;
}

export interface CreateOrderPayload {
  items: CreateOrderItem[];
  delivery_address?: string;
  source_broadcast_id?: number;
}

export type PaymentProvider = 'payme' | 'click' | 'cash';

export interface Payment {
  id: number;
  order_id: number;
  provider: PaymentProvider;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'cancelled';
  checkout_url?: string | null;
}

export interface NotificationItem {
  id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ProductSort = 'recent' | 'popular' | 'rating' | 'price_asc' | 'price_desc';

export interface ProductListParams {
  city?: number;
  category?: number;
  q?: string;
  sort?: ProductSort;
  offset?: number;
  limit?: number;
}
