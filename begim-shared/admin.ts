// Begim — эндпоинты бэк-офиса (role=admin). Используются в begim-frontend/admin.
// Контракт — begim-backend/API.md §16.

import { api } from './http';
import type { Order, Paginated, Product, Seller } from './types';

export interface AdminDashboard {
  users_total: number;
  sellers_total: number;
  sellers_pending: number;
  products_total: number;
  orders_total: number;
  gmv_minor: number;
}

export const getAdminDashboard = () => api.get<AdminDashboard>('/admin/dashboard');

export const getAdminSellers = (verification?: 'pending' | 'verified' | 'rejected') =>
  api.get<Paginated<Seller>>('/admin/sellers', verification ? { verification } : undefined);
export const verifySeller = (id: number, approve: boolean) =>
  api.post<Seller>(`/admin/sellers/${id}/verify`, { approve });

export const getAdminProducts = (status?: string) =>
  api.get<Paginated<Product>>('/admin/products', status ? { status } : undefined);
export const blockProduct = (id: number) => api.post<Product>(`/admin/products/${id}/block`);

export const getAdminOrders = (status?: string) =>
  api.get<Paginated<Order>>('/admin/orders', status ? { status } : undefined);

export const getAdminUsers = () =>
  api.get<Paginated<{ id: number; tg_id: number; role: string }>>('/admin/users');

export interface NewCity {
  name: string;
  slug: string;
}
export const createCity = (payload: NewCity) => api.post('/admin/cities', payload);
export const toggleCity = (id: number, isActive: boolean) =>
  api.patch(`/admin/cities/${id}`, { is_active: isActive });
