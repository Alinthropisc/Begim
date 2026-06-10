// Begim — типизированные функции эндпоинтов поверх общего HTTP-слоя.
// Покрывают то, что нужно Mini App и бэк-офису. Полный контракт — begim-backend/API.md.

import { api } from './http';
import type {
  Category,
  City,
  CommunityPost,
  CreateOrderPayload,
  NotificationItem,
  Order,
  Paginated,
  Payment,
  PaymentProvider,
  Product,
  ProductListParams,
  Recipe,
  Seller,
  Story,
} from './types';

// --- Справочники -----------------------------------------------------------
export const getCities = () => api.get<City[]>('/cities');
export const getCategories = () => api.get<Category[]>('/categories');

// --- Продукты --------------------------------------------------------------
export const listProducts = (params?: ProductListParams) =>
  api.get<Paginated<Product>>('/products', params as Record<string, unknown> | undefined);
export const getProduct = (id: number) => api.get<Product>(`/products/${id}`);

// --- Продавцы --------------------------------------------------------------
export const getSeller = (idOrSlug: string | number) => api.get<Seller>(`/sellers/${idOrSlug}`);
export const getSellerProducts = (id: number) => api.get<Paginated<Product>>(`/sellers/${id}/products`);
export const getSellerStories = (id: number) => api.get<Story[]>(`/sellers/${id}/stories`);
export const followSeller = (id: number) => api.post<void>(`/sellers/${id}/follow`);
export const unfollowSeller = (id: number) => api.del<void>(`/sellers/${id}/follow`);

// --- Сторис ----------------------------------------------------------------
export const getStoriesFeed = () => api.get<Story[]>('/stories/feed');
export const viewStory = (id: number) => api.post<void>(`/stories/${id}/view`);

// --- Сообщество и рецепты --------------------------------------------------
export const getFeed = () => api.get<Paginated<CommunityPost>>('/feed');
export const likePost = (id: number) => api.post<void>(`/posts/${id}/like`);
export const unlikePost = (id: number) => api.post<void>(`/posts/${id}/unlike`);
export const listRecipes = () => api.get<Paginated<Recipe>>('/recipes');
export const getRecipe = (id: number) => api.get<Recipe>(`/recipes/${id}`);
export const likeRecipe = (id: number) => api.post<void>(`/recipes/${id}/like`);
export const saveRecipe = (id: number) => api.post<void>(`/recipes/${id}/save`);

// --- Заказы ----------------------------------------------------------------
export const createOrder = (payload: CreateOrderPayload) => api.post<Order>('/orders', payload);
export const getOrder = (id: number) => api.get<Order>(`/orders/${id}`);
export const getMyOrders = () => api.get<Paginated<Order>>('/me/orders');
export const cancelOrder = (id: number, reason: string) =>
  api.post<Order>(`/orders/${id}/cancel`, { reason });

// --- Платежи ---------------------------------------------------------------
export const createPayment = (orderId: number, provider: PaymentProvider) =>
  api.post<Payment>(`/orders/${orderId}/payments`, { provider });
export const getPayment = (id: number) => api.get<Payment>(`/payments/${id}`);

// --- Профиль ---------------------------------------------------------------
export const setMyPhone = (phone: string) => api.patch<void>('/me/phone', { phone });
export const getSavedRecipes = () => api.get<Paginated<Recipe>>('/me/saved-recipes');
export const getMyFollows = () => api.get<Seller[]>('/me/follows');

// --- Уведомления -----------------------------------------------------------
export const getNotifications = () => api.get<Paginated<NotificationItem>>('/me/notifications');
export const markNotificationRead = (id: number) => api.post<void>(`/me/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.post<void>('/me/notifications/read-all');
