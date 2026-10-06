import type { IsoDateTime } from './common';

/**
 * A "voucher" is a **free-service reward**: it grants a specific service for free
 * and customers redeem it with star points in the customer Rewards Center.
 * Backed by the shared `reward_items` table (not a discount code).
 */
export type VoucherStatus = 'available' | 'unavailable';

export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  available: 'Available',
  unavailable: 'Unavailable',
};

export interface Voucher {
  id: string;
  /** Customer-facing reward name shown in the Rewards Center. */
  name: string;
  description: string;
  /** The service granted for free; null = generic reward. */
  serviceId: string | null;
  /** Resolved service name for display (read-only). */
  serviceName: string | null;
  /** Star points required to redeem. */
  pointsCost: number;
  /** Image key or full URL; falls back to the service image when empty. */
  imageKey: string | null;
  /** Whether it currently shows in the customer Rewards Center. */
  available: boolean;
  sort: number;
  createdAt: IsoDateTime;
}

/** Payload accepted by create/update — server-managed fields omitted. */
export interface VoucherInput {
  name: string;
  description: string;
  serviceId: string | null;
  pointsCost: number;
  imageKey: string | null;
  available: boolean;
}
