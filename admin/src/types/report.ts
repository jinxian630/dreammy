import type { CurrencyCode } from './common';

/** A single point on a daily time series (minor units for money series). */
export interface TrendPoint {
  /** Short axis label, e.g. "1 Sep". */
  label: string;
  /** ISO date for tooltips/sorting. */
  date: string;
  value: number;
}

export interface ServiceBreakdownRow {
  serviceId: string;
  serviceName: string;
  category: string;
  paidOrders: number;
  grossMinor: number;
  discountsMinor: number;
  refundsMinor: number;
  netMinor: number;
}

/** A slice of the order-status donut (payment + fulfillment mix, as shown in UI). */
export interface StatusSlice {
  key: string;
  label: string;
  count: number;
  /** Whole-number percent of total orders. */
  percent: number;
  tone: 'success' | 'info' | 'lavender' | 'blush' | 'warn' | 'muted';
}

/**
 * Aggregated report for one currency. `netMinor = grossMinor - discountsMinor -
 * refundsMinor` — this is net sales, NOT profit (operating costs are excluded).
 */
export interface ReportSummary {
  currency: CurrencyCode;
  grossMinor: number;
  discountsMinor: number;
  refundsMinor: number;
  netMinor: number;
  totalOrders: number;
  paidOrders: number;
  /** Whole-number percent of orders that are paid. */
  conversionRate: number;
  avgOrderValueMinor: number;
  salesTrend: TrendPoint[];
  serviceBreakdown: ServiceBreakdownRow[];
  statusDistribution: StatusSlice[];
}
