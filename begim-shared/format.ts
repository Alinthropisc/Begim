// Begim — общие форматтеры. Деньги в API — целые *_minor (тийины UZS).

/** 18000000 (тийины) → "180 000 so'm". 1 so'm = 100 tiyin. */
export function formatMoney(minor: number, currency = "so'm"): string {
  const major = Math.round(minor / 100);
  const grouped = major.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${grouped} ${currency}`;
}

/** Только целые сумы без копеек (для компактного UI). */
export function minorToMajor(minor: number): number {
  return Math.round(minor / 100);
}

export function majorToMinor(major: number): number {
  return Math.round(major * 100);
}

/** ISO-8601 → "8 iyun, 14:30" (локаль по умолчанию uz). */
export function formatDateTime(iso: string, locale = 'uz-UZ'): string {
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso;
    return date.toLocaleString(locale, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}
