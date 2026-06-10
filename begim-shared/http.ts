// Begim — общий HTTP-слой. Framework-agnostic, на нативном fetch (без axios),
// чтобы один и тот же код работал и в Mini App, и в бэк-офисе.
//
// Использование (в каждом приложении один раз на старте):
//   configureApi({ baseUrl: import.meta.env.VITE_API_URL, getInitData: () => tg.initData })
//
// Дальше любой модуль вызывает apiFetch / endpoints.* — конфиг уже задан.

import type { ApiErrorBody, AuthResponse } from './types';

export interface TokenStorage {
  getAccess(): string | null;
  getRefresh(): string | null;
  set(access: string, refresh: string): void;
  clear(): void;
}

/** Хранилище токенов в localStorage (дефолт для веба и Mini App). */
export function localStorageTokens(prefix = 'begim'): TokenStorage {
  const aKey = `${prefix}.access`;
  const rKey = `${prefix}.refresh`;
  const safe = typeof localStorage !== 'undefined';
  return {
    getAccess: () => (safe ? localStorage.getItem(aKey) : null),
    getRefresh: () => (safe ? localStorage.getItem(rKey) : null),
    set: (access, refresh) => {
      if (!safe) return;
      localStorage.setItem(aKey, access);
      localStorage.setItem(rKey, refresh);
    },
    clear: () => {
      if (!safe) return;
      localStorage.removeItem(aKey);
      localStorage.removeItem(rKey);
    },
  };
}

export interface ApiConfig {
  /** Базовый URL с префиксом, напр. http://localhost:8000/api/v1 */
  baseUrl: string;
  /** Хранилище токенов. По умолчанию localStorage. */
  tokens?: TokenStorage;
  /** Возвращает Telegram initData (для авто-логина при 401 без refresh). */
  getInitData?: () => string;
  /** Вызывается, когда сессия окончательно протухла (refresh не прошёл). */
  onAuthExpired?: () => void;
}

interface ResolvedConfig {
  baseUrl: string;
  tokens: TokenStorage;
  getInitData?: () => string;
  onAuthExpired?: () => void;
}

let config: ResolvedConfig | null = null;

export function configureApi(cfg: ApiConfig): void {
  config = {
    baseUrl: cfg.baseUrl.replace(/\/$/, ''),
    tokens: cfg.tokens ?? localStorageTokens(),
    getInitData: cfg.getInitData,
    onAuthExpired: cfg.onAuthExpired,
  };
}

export function getTokens(): TokenStorage {
  return requireConfig().tokens;
}

export function getInitData(): string | undefined {
  return config?.getInitData?.();
}

export function isConfigured(): boolean {
  return config !== null;
}

/** Ошибка API с разобранным телом по контракту { error: {code,message,details} }. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, unknown>;

  constructor(status: number, body: ApiErrorBody | null, fallback: string) {
    super(body?.error?.message ?? fallback);
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code ?? `HTTP_${status}`;
    this.details = body?.error?.details;
  }
}

function requireConfig(): ResolvedConfig {
  if (!config) throw new Error('Begim API не сконфигурирован: вызовите configureApi() на старте.');
  return config;
}

function buildUrl(path: string, params?: Record<string, unknown>): string {
  const cfg = requireConfig();
  const url = new URL(cfg.baseUrl + (path.startsWith('/') ? path : `/${path}`));
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, unknown>;
  /** Не подставлять Authorization (для /auth/telegram). */
  anonymous?: boolean;
  signal?: AbortSignal;
}

async function rawFetch(path: string, opts: RequestOptions, accessToken: string | null): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  let body: BodyInit | undefined;
  if (opts.body !== undefined) {
    if (opts.body instanceof FormData) {
      body = opts.body;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }
  }
  if (!opts.anonymous && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  return fetch(buildUrl(path, opts.params), {
    method: opts.method ?? 'GET',
    headers,
    body,
    signal: opts.signal,
  });
}

let refreshInFlight: Promise<boolean> | null = null;

/** Пытается обновить access по refresh-токену. Возвращает true при успехе. */
async function tryRefresh(): Promise<boolean> {
  const cfg = requireConfig();
  const refresh = cfg.tokens.getRefresh();
  if (!refresh) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await rawFetch(
          '/auth/refresh',
          { method: 'POST', body: { refresh_token: refresh }, anonymous: true },
          null,
        );
        if (!res.ok) return false;
        const data = (await res.json()) as AuthResponse;
        cfg.tokens.set(data.access_token, data.refresh_token);
        return true;
      } catch {
        return false;
      } finally {
        setTimeout(() => (refreshInFlight = null), 0);
      }
    })();
  }
  return refreshInFlight;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | null = null;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* пустое/не-JSON тело */
  }
  return new ApiError(res.status, body, res.statusText || 'Request failed');
}

/**
 * Основной запрос. Подставляет JWT, при 401 один раз пробует refresh и повтор.
 * Если refresh не прошёл — зовёт onAuthExpired и бросает ApiError.
 */
export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const cfg = requireConfig();
  let res = await rawFetch(path, opts, cfg.tokens.getAccess());

  if (res.status === 401 && !opts.anonymous) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawFetch(path, opts, cfg.tokens.getAccess());
    } else {
      cfg.tokens.clear();
      cfg.onAuthExpired?.();
    }
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>, signal?: AbortSignal) =>
    apiFetch<T>(path, { method: 'GET', params, signal }),
  post: <T>(path: string, body?: unknown, params?: Record<string, unknown>) =>
    apiFetch<T>(path, { method: 'POST', body, params }),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string) => apiFetch<T>(path, { method: 'DELETE' }),
};
