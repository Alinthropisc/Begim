import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureApi, localStorageTokens } from '../http';
import { hasSession, loginWithTelegram } from '../auth';

// ── hasSession ────────────────────────────────────────────────

describe('hasSession', () => {
  const store = localStorageTokens();

  beforeEach(() => {
    localStorage.clear();
    configureApi({ baseUrl: 'http://localhost:8000/api/v1', tokens: store });
  });
  afterEach(() => localStorage.clear());

  it('returns false when no access token', () => {
    expect(hasSession()).toBe(false);
  });

  it('returns true when access token is present', () => {
    store.set('some-access-token', 'some-refresh-token');
    expect(hasSession()).toBe(true);
  });

  it('returns false after tokens are cleared', () => {
    store.set('tok', 'ref');
    store.clear();
    expect(hasSession()).toBe(false);
  });
});

// ── loginWithTelegram — missing initData ──────────────────────

describe('loginWithTelegram', () => {
  beforeEach(() => {
    localStorage.clear();
    configureApi({
      baseUrl: 'http://localhost:8000/api/v1',
      getInitData: () => '',  // no Telegram context
    });
  });
  afterEach(() => localStorage.clear());

  it('throws when initData is empty and none provided', async () => {
    await expect(loginWithTelegram()).rejects.toThrow('initData');
  });

  it('throws when explicit empty string is passed', async () => {
    await expect(loginWithTelegram('')).rejects.toThrow('initData');
  });
});
