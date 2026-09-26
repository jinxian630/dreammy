import type { CurrencyCode, ReportSummary, TrendPoint } from '@/types';

/** Build a daily trend series for Sept 2026 from an array of major-unit values. */
function buildTrend(majorValues: number[]): TrendPoint[] {
  return majorValues.map((v, i) => {
    const day = i + 1;
    return {
      label: `${day} Sep`,
      date: `2026-09-${String(day).padStart(2, '0')}`,
      value: Math.round(v * 100), // store minor units
    };
  });
}

// Daily sales shape shown in the Reports "Daily Sales Trend" (peaks ~25 Sep).
const dailySalesMajor = [
  120, 140, 130, 180, 160, 150, 200, 190, 175, 210, 230, 205, 240, 220, 260, 250,
  280, 270, 300, 285, 260, 290, 320, 330, 430, 360, 340, 300, 330, 310,
];

const myrSummary: ReportSummary = {
  currency: 'MYR',
  grossMinor: 260000,
  discountsMinor: 12000,
  refundsMinor: 8000,
  netMinor: 240000,
  totalOrders: 120,
  paidOrders: 78,
  conversionRate: 65,
  avgOrderValueMinor: 2167,
  salesTrend: buildTrend(dailySalesMajor),
  serviceBreakdown: [
    { serviceId: 'svc-candle-runs', serviceName: 'Candle Runs', category: 'Candle Runs', paidOrders: 34, grossMinor: 80000, discountsMinor: 4000, refundsMinor: 0, netMinor: 76000 },
    { serviceId: 'svc-hearts', serviceName: 'Heart Delivery', category: 'Hearts', paidOrders: 28, grossMinor: 60000, discountsMinor: 2000, refundsMinor: 2000, netMinor: 56000 },
    { serviceId: 'svc-seasonal', serviceName: 'Seasonal Care', category: 'Seasonal', paidOrders: 42, grossMinor: 90000, discountsMinor: 5000, refundsMinor: 6000, netMinor: 79000 },
    { serviceId: 'svc-companions', serviceName: 'Companions', category: 'Companions', paidOrders: 16, grossMinor: 30000, discountsMinor: 1000, refundsMinor: 0, netMinor: 29000 },
  ],
  statusDistribution: [
    { key: 'paid', label: 'Paid', count: 78, percent: 65, tone: 'success' },
    { key: 'in_progress', label: 'In progress', count: 24, percent: 20, tone: 'info' },
    { key: 'pending', label: 'Pending', count: 10, percent: 8, tone: 'lavender' },
    { key: 'cancelled', label: 'Cancelled', count: 8, percent: 7, tone: 'blush' },
  ],
};

// A smaller China-server (CNY) book, kept strictly separate from MYR.
const cnyDailyMajor = [
  20, 26, 18, 30, 22, 28, 34, 26, 24, 30, 32, 28, 36, 30, 40, 34,
  38, 30, 42, 36, 30, 34, 40, 44, 52, 46, 40, 36, 44, 38,
];

const cnySummary: ReportSummary = {
  currency: 'CNY',
  grossMinor: 52000,
  discountsMinor: 2000,
  refundsMinor: 1500,
  netMinor: 48500,
  totalOrders: 22,
  paidOrders: 15,
  conversionRate: 68,
  avgOrderValueMinor: 3467,
  salesTrend: buildTrend(cnyDailyMajor),
  serviceBreakdown: [
    { serviceId: 'svc-companions', serviceName: 'Companions', category: 'Companions', paidOrders: 9, grossMinor: 26000, discountsMinor: 1000, refundsMinor: 0, netMinor: 25000 },
    { serviceId: 'svc-candle-runs', serviceName: 'Candle Runs', category: 'Candle Runs', paidOrders: 6, grossMinor: 16000, discountsMinor: 500, refundsMinor: 1500, netMinor: 14000 },
    { serviceId: 'svc-hearts', serviceName: 'Heart Delivery', category: 'Hearts', paidOrders: 5, grossMinor: 10000, discountsMinor: 500, refundsMinor: 0, netMinor: 9500 },
  ],
  statusDistribution: [
    { key: 'paid', label: 'Paid', count: 15, percent: 68, tone: 'success' },
    { key: 'in_progress', label: 'In progress', count: 4, percent: 18, tone: 'info' },
    { key: 'pending', label: 'Pending', count: 2, percent: 9, tone: 'lavender' },
    { key: 'cancelled', label: 'Cancelled', count: 1, percent: 5, tone: 'blush' },
  ],
};

export const mockReports: Record<CurrencyCode, ReportSummary> = {
  MYR: myrSummary,
  CNY: cnySummary,
};
