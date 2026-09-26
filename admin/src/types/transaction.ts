import type { CurrencyCode, IsoDateTime } from './common';

export type TransactionType = 'charge' | 'refund' | 'discount';

/** A ledger entry underlying an order's money movements (mock reporting source). */
export interface Transaction {
  id: string;
  orderId: string;
  orderCode: string;
  type: TransactionType;
  /** Signed minor units: charges positive, refunds/discounts negative. */
  amountMinor: number;
  currency: CurrencyCode;
  serviceId: string | null;
  occurredAt: IsoDateTime;
}
