import { describe, expect, it } from 'vitest';
import { formatDateTime, formatMoney, majorToMinor, minorToMajor } from '../format';

// ── formatMoney ───────────────────────────────────────────────

describe('formatMoney', () => {
  it('converts tiyins to soʼm with thousand separators', () => {
    expect(formatMoney(18_000_000)).toBe("180 000 so'm");
  });

  it('handles 1 soʼm (100 tiyin)', () => {
    expect(formatMoney(100)).toBe("1 so'm");
  });

  it('handles zero', () => {
    expect(formatMoney(0)).toBe("0 so'm");
  });

  it('formats large amount correctly', () => {
    expect(formatMoney(1_000_000_000)).toBe("10 000 000 so'm");
  });

  it('accepts custom currency label', () => {
    expect(formatMoney(500_000, '₸')).toBe("5 000 ₸");
  });

  it('rounds half up — 150 tiyin → 2 soʼm', () => {
    expect(formatMoney(150)).toBe("2 so'm");
  });

  it('rounds down — 149 tiyin → 1 soʼm', () => {
    expect(formatMoney(149)).toBe("1 so'm");
  });
});

// ── minorToMajor ──────────────────────────────────────────────

describe('minorToMajor', () => {
  it('divides by 100', () => {
    expect(minorToMajor(18_000_000)).toBe(180_000);
  });

  it('rounds fractional result', () => {
    expect(minorToMajor(150)).toBe(2);
    expect(minorToMajor(149)).toBe(1);
  });

  it('zero stays zero', () => {
    expect(minorToMajor(0)).toBe(0);
  });
});

// ── majorToMinor ──────────────────────────────────────────────

describe('majorToMinor', () => {
  it('multiplies by 100', () => {
    expect(majorToMinor(180_000)).toBe(18_000_000);
  });

  it('zero stays zero', () => {
    expect(majorToMinor(0)).toBe(0);
  });

  it('rounds fractional input', () => {
    // 1.5 soʼm → 150 tiyin (clean float)
    expect(majorToMinor(1.5)).toBe(150);
  });
});

// ── round-trip ────────────────────────────────────────────────

describe('minor ↔ major round-trip', () => {
  it('180 000 soʼm survives round-trip', () => {
    const original = 18_000_000;
    expect(majorToMinor(minorToMajor(original))).toBe(original);
  });
});

// ── formatDateTime ────────────────────────────────────────────

describe('formatDateTime', () => {
  it('returns a non-empty string for a valid ISO date', () => {
    const result = formatDateTime('2024-06-08T14:30:00Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('falls back to the raw string on invalid input', () => {
    expect(formatDateTime('not-a-date')).toBe('not-a-date');
    expect(formatDateTime('')).toBe('');
  });
});
