import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  ApiError,
  configureApi,
  isConfigured,
  localStorageTokens,
} from '../http';

// ── ApiError ──────────────────────────────────────────────────

describe('ApiError', () => {
  it('parses structured error body', () => {
    const body = { error: { code: 'NOT_FOUND', message: 'Product not found', details: { id: 5 } } };
    const err = new ApiError(404, body, 'fallback');
    expect(err.status).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
    expect(err.message).toBe('Product not found');
    expect(err.details).toEqual({ id: 5 });
    expect(err.name).toBe('ApiError');
  });

  it('falls back to HTTP_<status> code when body is null', () => {
    const err = new ApiError(500, null, 'Internal error');
    expect(err.code).toBe('HTTP_500');
    expect(err.message).toBe('Internal error');
  });

  it('falls back when body has no error field', () => {
    const err = new ApiError(422, null, 'Unprocessable');
    expect(err.message).toBe('Unprocessable');
    expect(err.details).toBeUndefined();
  });

  it('is an instance of Error', () => {
    expect(new ApiError(400, null, 'bad')).toBeInstanceOf(Error);
  });
});

// ── localStorageTokens ────────────────────────────────────────

describe('localStorageTokens', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('returns null when no tokens stored', () => {
    const store = localStorageTokens();
    expect(store.getAccess()).toBeNull();
    expect(store.getRefresh()).toBeNull();
  });

  it('stores and retrieves access + refresh tokens', () => {
    const store = localStorageTokens();
    store.set('acc-abc', 'ref-xyz');
    expect(store.getAccess()).toBe('acc-abc');
    expect(store.getRefresh()).toBe('ref-xyz');
  });

  it('clear removes both tokens', () => {
    const store = localStorageTokens();
    store.set('acc', 'ref');
    store.clear();
    expect(store.getAccess()).toBeNull();
    expect(store.getRefresh()).toBeNull();
  });

  it('different prefixes do not collide', () => {
    const a = localStorageTokens('app-a');
    const b = localStorageTokens('app-b');
    a.set('token-a', 'refresh-a');
    expect(b.getAccess()).toBeNull();
  });

  it('overwrite replaces previous tokens', () => {
    const store = localStorageTokens();
    store.set('old-acc', 'old-ref');
    store.set('new-acc', 'new-ref');
    expect(store.getAccess()).toBe('new-acc');
  });
});

// ── configureApi / isConfigured ───────────────────────────────

describe('configureApi / isConfigured', () => {
  it('isConfigured returns true after configureApi is called', () => {
    configureApi({ baseUrl: 'http://localhost:8000/api/v1' });
    expect(isConfigured()).toBe(true);
  });

  it('accepts baseUrl with trailing slash without throwing', () => {
    expect(() => configureApi({ baseUrl: 'http://localhost:8000/api/v1/' })).not.toThrow();
    expect(isConfigured()).toBe(true);
  });
});
