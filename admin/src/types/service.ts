import type { CurrencyCode, IsoDateTime, ServerRegion } from './common';

export type ServiceStatus = 'active' | 'draft' | 'archived';

/** Service category slug (Sky game service groupings). */
export type ServiceCategory =
  | 'candle-runs'
  | 'taxi-services'
  | 'hearts'
  | 'seasonal'
  | 'companions'
  | 'other';

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'candle-runs': 'Candle Runs',
  'taxi-services': 'Taxi Services',
  hearts: 'Hearts',
  seasonal: 'Seasonal',
  companions: 'Companions',
  other: 'Other',
};

export type ServiceDuration = '1d' | '7d' | '30d';

export const SERVICE_DURATION_LABELS: Record<ServiceDuration, string> = {
  '1d': '1 day',
  '7d': '7 days',
  '30d': '30 days',
};

export interface Service {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  description: string;
  /** Base price in integer minor units. */
  priceMinor: number;
  currency: CurrencyCode;
  /** Key resolved through `src/lib/images.ts`; empty slot when the file is absent. */
  imageKey: string | null;
  status: ServiceStatus;
  server: ServerRegion;
  duration: ServiceDuration;
  /** Configurable game options (e.g. target candles), each with selectable values. */
  options: ServiceOption[];
  /** Preferred-time hint shown to customers (optional). */
  preferredTime: string | null;
  /** Estimated completion time label, e.g. "1 day". */
  estimatedCompletion: string;
  /** Customer-facing instructions shown before ordering. */
  customerInstructions: string;
  ordersCount: number;
  updatedAt: IsoDateTime;
  createdAt: IsoDateTime;
}

export interface ServiceOption {
  key: string;
  label: string;
  values: string[];
  defaultValue: string;
}

/** Payload accepted by create/update — server-managed fields omitted. */
export interface ServiceInput {
  name: string;
  category: ServiceCategory;
  description: string;
  priceMinor: number;
  currency: CurrencyCode;
  imageKey: string | null;
  status: Exclude<ServiceStatus, 'archived'>;
  server: ServerRegion;
  duration: ServiceDuration;
  options: ServiceOption[];
  preferredTime: string | null;
  estimatedCompletion: string;
  customerInstructions: string;
}
