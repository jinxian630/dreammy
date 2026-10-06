import type {
  CurrencyCode,
  FulfillmentStatus,
  PaymentStatus,
  ServiceCategory,
  ServiceStatus,
} from '@/types';

export interface ServiceQuery {
  search?: string;
  category?: ServiceCategory | 'all';
  status?: ServiceStatus | 'all';
  page?: number;
  perPage?: number;
}

export interface OrderQuery {
  search?: string;
  serviceId?: string | 'all';
  guardianId?: string | 'all';
  /** Filter by assigned staff user id, or 'unassigned' for orders with no assignee. */
  assignedStaffId?: string | 'all' | 'unassigned';
  currency?: CurrencyCode | 'all';
  paymentStatus?: PaymentStatus | 'all';
  fulfillmentStatus?: FulfillmentStatus | 'all';
  /** ISO date (inclusive) lower/upper bounds on createdAt. */
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
}

export interface VoucherQuery {
  search?: string;
  status?: 'all' | 'available' | 'unavailable';
}

export type ScreenshotSlot = 'before' | 'after';
