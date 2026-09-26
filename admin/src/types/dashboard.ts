import type { CurrencyCode } from './common';
import type { TrendPoint } from './report';

export interface StatDelta {
  /** Signed percentage change vs the previous period, e.g. +12 or -10. */
  percent: number;
  periodLabel: string;
}

export interface DashboardMetrics {
  currency: CurrencyCode;
  totalRevenueMinor: number;
  revenueDelta: StatDelta;
  paidOrders: number;
  paidOrdersDelta: StatDelta;
  activeOrders: number;
  activeOrdersDelta: StatDelta;
  pendingRefunds: number;
  pendingRefundsDelta: StatDelta;
  revenueTrend: TrendPoint[];
  serviceSales: ServiceSalesPoint[];
  recentOrders: RecentOrderRow[];
}

export interface ServiceSalesPoint {
  label: string;
  unitsSold: number;
  revenueMinor: number;
}

export interface RecentOrderRow {
  id: string;
  code: string;
  player: string;
  service: string;
  amountMinor: number;
  currency: CurrencyCode;
  status: string;
  statusTone: 'success' | 'info' | 'warn' | 'muted';
}
