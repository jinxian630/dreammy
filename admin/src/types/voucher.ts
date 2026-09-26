import type { CurrencyCode, IsoDateTime } from './common';

export type VoucherDiscountType = 'fixed' | 'percentage';

/**
 * Lifecycle status. `disabled` means the admin turned the active toggle off;
 * `scheduled`/`active`/`expired` are derived from the validity window.
 */
export type VoucherStatus = 'active' | 'scheduled' | 'disabled' | 'expired';

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  disabled: 'Disabled',
  expired: 'Expired',
};

export interface Voucher {
  id: string;
  code: string;
  internalName: string;
  discountType: VoucherDiscountType;
  /** Discount amount in minor units when `discountType === 'fixed'`. */
  valueMinor: number | null;
  /** Whole-number percent (e.g. 10) when `discountType === 'percentage'`. */
  percent: number | null;
  currency: CurrencyCode;
  minSpendMinor: number;
  /** Cap on the discount for percentage vouchers (minor units); null = uncapped. */
  maxDiscountMinor: number | null;
  /** Service ids this voucher applies to; empty = all services. */
  eligibleServiceIds: string[];
  /** Validity window, expressed in Malaysia Time (MYT, UTC+8). */
  startAt: IsoDateTime;
  endAt: IsoDateTime;
  totalLimit: number;
  perCustomerLimit: number;
  usedCount: number;
  /** Admin toggle. When false the derived status is `disabled`. */
  active: boolean;
}

export interface VoucherInput {
  code: string;
  internalName: string;
  discountType: VoucherDiscountType;
  valueMinor: number | null;
  percent: number | null;
  currency: CurrencyCode;
  minSpendMinor: number;
  maxDiscountMinor: number | null;
  eligibleServiceIds: string[];
  startAt: IsoDateTime;
  endAt: IsoDateTime;
  totalLimit: number;
  perCustomerLimit: number;
  active: boolean;
}
