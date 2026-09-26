import type { CurrencyCode, DashboardMetrics, Order, RecentOrderRow, TrendPoint } from '@/types';
import { mockOrders } from './orders';

function buildTrend(majorValues: number[]): TrendPoint[] {
  return majorValues.map((v, i) => {
    const day = i + 1;
    return { label: `${day} Sep`, date: `2026-09-${String(day).padStart(2, '0')}`, value: Math.round(v * 100) };
  });
}

// Revenue trend peaks at RM 320 on 18 Sep, matching the Overview template.
const revenueMajor = [
  120, 100, 130, 150, 120, 140, 180, 160, 150, 170, 200, 175, 190, 210, 230, 250,
  270, 320, 240, 260, 250, 230, 260, 280, 300, 285, 270, 290, 300, 320,
];

const cnyRevenueMajor = revenueMajor.map((v) => Math.round(v * 0.2));

/** Derive a compact recent-orders row from a canonical order. */
function toRecentRow(order: Order): RecentOrderRow {
  let status = 'Paid';
  let statusTone: RecentOrderRow['statusTone'] = 'success';
  if (order.paymentStatus === 'refunded' || order.fulfillmentStatus === 'cancelled') {
    status = 'Refunded';
    statusTone = 'muted';
  } else if (order.paymentStatus === 'pending') {
    status = 'Pending';
    statusTone = 'warn';
  } else if (order.fulfillmentStatus === 'in_progress' || order.fulfillmentStatus === 'awaiting_guardian') {
    status = 'Active';
    statusTone = 'info';
  }
  return {
    id: order.id,
    code: order.code,
    player: order.traveler.name,
    service: order.serviceName,
    amountMinor: order.amountMinor,
    currency: order.currency,
    status,
    statusTone,
  };
}

function metricsFor(currency: CurrencyCode): DashboardMetrics {
  const isMyr = currency === 'MYR';
  const recentOrders = mockOrders
    .filter((o) => o.currency === currency)
    .slice(0, 5)
    .map(toRecentRow);

  return {
    currency,
    totalRevenueMinor: isMyr ? 248000 : 52000,
    revenueDelta: { percent: 12, periodLabel: 'vs previous 30 days' },
    paidOrders: isMyr ? 124 : 15,
    paidOrdersDelta: { percent: 18, periodLabel: 'vs previous 30 days' },
    activeOrders: isMyr ? 18 : 4,
    activeOrdersDelta: { percent: -10, periodLabel: 'vs previous 30 days' },
    pendingRefunds: isMyr ? 3 : 1,
    pendingRefundsDelta: { percent: 50, periodLabel: 'vs previous 30 days' },
    revenueTrend: buildTrend(isMyr ? revenueMajor : cnyRevenueMajor),
    serviceSales: [
      { label: 'Candle Runs', unitsSold: isMyr ? 52 : 6, revenueMinor: isMyr ? 80000 : 16000 },
      { label: 'Heart Delivery', unitsSold: isMyr ? 36 : 5, revenueMinor: isMyr ? 60000 : 10000 },
      { label: 'Seasonal Care', unitsSold: isMyr ? 22 : 2, revenueMinor: isMyr ? 90000 : 6000 },
      { label: 'Companions', unitsSold: isMyr ? 14 : 9, revenueMinor: isMyr ? 30000 : 26000 },
      { label: 'Other', unitsSold: isMyr ? 8 : 0, revenueMinor: isMyr ? 20000 : 0 },
    ],
    recentOrders: recentOrders.length > 0 ? recentOrders : mockOrders.slice(0, 5).map(toRecentRow),
  };
}

export const mockDashboard: Record<CurrencyCode, DashboardMetrics> = {
  MYR: metricsFor('MYR'),
  CNY: metricsFor('CNY'),
};
