import type { IsoDateTime } from '@/types/common';

/** Malaysia time zone used across the admin (MYT, UTC+8). */
export const MYT_TIME_ZONE = 'Asia/Kuala_Lumpur';

const dateFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: MYT_TIME_ZONE,
});

const dateTimeFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: MYT_TIME_ZONE,
});

/** e.g. "26 Sep 2026". */
export function formatDate(iso: IsoDateTime | null | undefined): string {
  if (!iso) return '—';
  return dateFmt.format(new Date(iso));
}

/** e.g. "26 Sep 2026, 14:32". */
export function formatDateTime(iso: IsoDateTime | null | undefined): string {
  if (!iso) return '—';
  return dateTimeFmt.format(new Date(iso)).replace(',', ',');
}

/** Signed percentage, e.g. "+12%" / "-10%" / "—" for zero. */
export function formatDelta(percent: number): string {
  if (percent === 0) return '—';
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent}%`;
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-MY');
}
