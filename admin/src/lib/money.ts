import type { CurrencyCode, Money } from '@/types/common';

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  MYR: 'RM',
  CNY: '¥',
};

export function currencySymbol(currency: CurrencyCode): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/** Build a Money value object from integer minor units. */
export function money(minor: number, currency: CurrencyCode = 'MYR'): Money {
  return { minor, currency };
}

/** Convert a major-unit input (e.g. "12.35") to minor units without float drift. */
export function toMinor(major: number | string): number {
  const n = typeof major === 'string' ? Number(major) : major;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

/** Convert minor units back to a major-unit number (for form fields). */
export function toMajor(minor: number): number {
  return minor / 100;
}

/**
 * Format minor units for display, e.g. formatMoney(260000) -> "RM 2,600.00".
 * Pass `compact` to drop the decimals for whole amounts in tight UI.
 */
export function formatMoney(
  minor: number,
  currency: CurrencyCode = 'MYR',
  opts: { withSymbol?: boolean; decimals?: boolean } = {},
): string {
  const { withSymbol = true, decimals = true } = opts;
  const value = minor / 100;
  const formatted = value.toLocaleString('en-MY', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  });
  return withSymbol ? `${currencySymbol(currency)} ${formatted}` : formatted;
}
