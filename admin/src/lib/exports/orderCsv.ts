import type { Order } from '@/types';
import { buildCsv, type CsvColumn } from '@/lib/csv';
import { formatMoney } from '@/lib/money';
import { FULFILLMENT_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/types';

/** Money as a plain major-unit string for spreadsheets, e.g. "8.00". */
function amount(minor: number): string {
  return (minor / 100).toFixed(2);
}

export interface OrderColumnDef extends CsvColumn<Order> {
  key: string;
  header: string;
  /** Contact columns are excluded from export unless explicitly opted in. */
  contact?: boolean;
  default: boolean;
}

/** All available export columns, in display order. */
export const ORDER_EXPORT_COLUMNS: OrderColumnDef[] = [
  { key: 'code', header: 'Order ID', value: (o) => o.code, default: true },
  { key: 'date', header: 'Date', value: (o) => o.createdAt.slice(0, 10), default: true },
  { key: 'traveler', header: 'Traveler', value: (o) => o.traveler.name, default: true },
  { key: 'service', header: 'Service', value: (o) => o.serviceName, default: true },
  { key: 'guardian', header: 'Guardian', value: (o) => o.guardianName ?? '', default: true },
  { key: 'currency', header: 'Currency', value: (o) => o.currency, default: true },
  { key: 'gross', header: 'Gross (Total)', value: (o) => amount(o.breakdown.subtotalMinor), default: true },
  { key: 'discount', header: 'Discount', value: (o) => amount(o.breakdown.discountMinor), default: true },
  { key: 'refund', header: 'Refund', value: (o) => amount(o.breakdown.refundMinor), default: true },
  { key: 'net', header: 'Net (Final amount)', value: (o) => amount(o.breakdown.totalMinor), default: true },
  { key: 'payment', header: 'Payment status', value: (o) => PAYMENT_STATUS_LABELS[o.paymentStatus], default: true },
  { key: 'fulfillment', header: 'Order status (Fulfillment)', value: (o) => FULFILLMENT_STATUS_LABELS[o.fulfillmentStatus], default: true },
  // Contact detail — OFF by default.
  { key: 'email', header: 'Traveler email', value: (o) => o.traveler.email, default: false, contact: true },
];

/**
 * Build the orders CSV. A leading comment row makes clear the file is demo data.
 * All cells are sanitized against CSV/formula injection by buildCsv.
 */
export function buildOrdersCsv(orders: Order[], columnKeys: string[]): string {
  const columns = ORDER_EXPORT_COLUMNS.filter((c) => columnKeys.includes(c.key));
  const body = buildCsv(orders, columns);
  return `# Dreammy — DEMO DATA export (not real orders)\r\n${body}`;
}
