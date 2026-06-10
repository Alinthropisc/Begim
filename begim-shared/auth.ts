// Begim — авторизация через Telegram initData. Вызывается из main-бутстрапа
// каждого приложения (begim-miniapp / begim-frontend).

import { api, getInitData, getTokens } from './http';
import type { AuthResponse, AuthUser } from './types';

/** Обмен Telegram initData на JWT-пару. Сохраняет токены в TokenStorage. */
export async function loginWithTelegram(initData?: string): Promise<AuthResponse> {
  const init = initData ?? getInitData();
  if (!init) throw new Error('Нет Telegram initData для авторизации.');
  const res = await api.post<AuthResponse>('/auth/telegram', { init_data: init });
  getTokens().set(res.access_token, res.refresh_token);
  return res;
}

/** Текущий пользователь по JWT. */
export function fetchMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me');
}

/** Инвалидирует refresh на бэке и чистит локальные токены. */
export async function logout(): Promise<void> {
  const refresh = getTokens().getRefresh();
  try {
    if (refresh) await api.post('/auth/logout', { refresh_token: refresh });
  } finally {
    getTokens().clear();
  }
}

/** Есть ли сохранённый access-токен (без проверки валидности). */
export function hasSession(): boolean {
  return getTokens().getAccess() !== null;
}

/**
 * Гарантирует сессию: если access уже есть — возвращает /auth/me,
 * иначе логинится по initData. Удобно дёргать на старте приложения.
 */
export async function ensureSession(initData?: string): Promise<AuthUser> {
  if (hasSession()) {
    try {
      return await fetchMe();
    } catch {
      // access протух и refresh не помог — упадём в повторный логин ниже
    }
  }
  const res = await loginWithTelegram(initData);
  return res.user;
}
