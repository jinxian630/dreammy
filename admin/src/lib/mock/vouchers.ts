import type { Voucher, VoucherStatus } from '@/types';

/** Seed vouchers — mirror the three shown in the Vouchers template. */
export const mockVouchers: Voucher[] = [
  {
    id: 'vch-welcome5',
    code: 'WELCOME5',
    internalName: 'Welcome Reward',
    discountType: 'fixed',
    valueMinor: 500,
    percent: null,
    currency: 'MYR',
    minSpendMinor: 2000,
    maxDiscountMinor: null,
    eligibleServiceIds: ['svc-candle-runs', 'svc-seasonal', 'svc-hearts'],
    startAt: '2025-01-01T00:00:00+08:00',
    endAt: '2025-12-31T23:59:00+08:00',
    totalLimit: 500,
    perCustomerLimit: 1,
    usedCount: 12,
    active: true,
  },
  {
    id: 'vch-sky10',
    code: 'SKY10',
    internalName: 'Sky Journey Deal',
    discountType: 'percentage',
    valueMinor: null,
    percent: 10,
    currency: 'MYR',
    minSpendMinor: 3000,
    maxDiscountMinor: 5000,
    eligibleServiceIds: [],
    startAt: '2025-05-20T00:00:00+08:00',
    endAt: '2025-05-31T23:59:00+08:00',
    totalLimit: 300,
    perCustomerLimit: 1,
    usedCount: 0,
    active: true,
  },
  {
    id: 'vch-thankyou5',
    code: 'THANKYOU5',
    internalName: 'Thank You Gift',
    discountType: 'fixed',
    valueMinor: 500,
    percent: null,
    currency: 'MYR',
    minSpendMinor: 2000,
    maxDiscountMinor: null,
    eligibleServiceIds: [],
    startAt: '2025-03-01T00:00:00+08:00',
    endAt: '2025-03-31T23:59:00+08:00',
    totalLimit: 120,
    perCustomerLimit: 1,
    usedCount: 120,
    active: true,
  },
];

/** Derive lifecycle status from the toggle + validity window (relative to now). */
export function deriveVoucherStatus(
  voucher: Pick<Voucher, 'active' | 'startAt' | 'endAt'>,
  now: Date = new Date(),
): VoucherStatus {
  const start = new Date(voucher.startAt);
  const end = new Date(voucher.endAt);
  if (!voucher.active) return 'disabled';
  if (now < start) return 'scheduled';
  if (now > end) return 'expired';
  return 'active';
}
