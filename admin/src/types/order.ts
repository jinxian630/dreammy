import type { CurrencyCode, IsoDateTime } from './common';

/** Payment state — kept strictly separate from fulfillment/service progress. */
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

/** Fulfillment (service delivery) state. */
export type FulfillmentStatus =
  | 'pending'
  | 'awaiting_guardian'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  refunded: 'Refunded',
};

export const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  pending: 'Pending',
  awaiting_guardian: 'Awaiting Guardian',
  in_progress: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export type TimelineState = 'done' | 'current' | 'pending';

export interface OrderEvent {
  id: string;
  label: string;
  description: string | null;
  state: TimelineState;
  happenedAt: IsoDateTime | null;
}

export interface OrderConfigItem {
  label: string;
  value: string;
}

export interface PaymentBreakdown {
  subtotalMinor: number;
  discountMinor: number;
  refundMinor: number;
  totalMinor: number;
}

export interface Order {
  id: string;
  code: string;
  traveler: {
    name: string;
    /** Contact detail — excluded from CSV export unless explicitly opted in. */
    email: string;
  };
  serviceId: string | null;
  serviceName: string;
  serviceTagline: string | null;
  serviceImageKey: string | null;
  category: string;
  config: OrderConfigItem[];
  currency: CurrencyCode;
  amountMinor: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  guardianId: string | null;
  guardianName: string | null;
  /** Internal team member responsible for this order (one order = one task). */
  assignment: {
    staffId: string | null;
    staffEmail: string | null;
    assignedById: string | null;
    assignedByEmail: string | null;
    assignedAt: IsoDateTime | null;
  } | null;
  progress: {
    current: number;
    target: number;
    unit: string;
  };
  breakdown: PaymentBreakdown;
  events: OrderEvent[];
  /** Admin-only note, never shown to customers. */
  internalNotes: string;
  /** Local-preview object URLs set by the admin; null until uploaded. */
  beforeScreenshot: string | null;
  afterScreenshot: string | null;
  createdAt: IsoDateTime;
  paidAt: IsoDateTime | null;
  completedAt: IsoDateTime | null;
}
