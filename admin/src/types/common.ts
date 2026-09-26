/** Supported store currencies. MYR and CNY totals are always kept separate. */
export type CurrencyCode = 'MYR' | 'CNY';

/**
 * A monetary amount stored as integer minor units (sen / fen) — never a float.
 * Mirrors the backend `App\Domain\Money\Money` value object.
 */
export interface Money {
  minor: number;
  currency: CurrencyCode;
}

/** Sky server region for a service. */
export type ServerRegion = 'global' | 'china';

/** Generic paginated envelope returned by list endpoints. */
export interface Paginated<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

/** ISO-8601 timestamp string, e.g. "2026-09-26T14:32:00+08:00". */
export type IsoDateTime = string;
