import 'server-only';
import type {
  CurrencyCode,
  Guardian,
  Order,
  OrderConfigItem,
  OrderEvent,
  Service,
  ServiceCategory,
  ServiceInput,
  ServiceOption,
  ServiceStatus,
  Voucher,
  VoucherInput,
  VoucherStatus,
} from '@/types';
import type { VoucherWithStatus } from './AdminApi';

/**
 * Row <-> type mapping between the shared Supabase (Postgres, snake_case) tables
 * and the admin app's camelCase domain types. The DB schema is owned by the
 * Laravel migrations in `customer/database/migrations`.
 */

const VALID_CATEGORIES: ServiceCategory[] = [
  'candle-runs',
  'hearts',
  'seasonal',
  'companions',
  'other',
];

function toCategory(slug: string | null | undefined): ServiceCategory {
  return VALID_CATEGORIES.includes((slug ?? '') as ServiceCategory)
    ? (slug as ServiceCategory)
    : 'other';
}

function iso(value: string | null | undefined): string {
  return value ?? new Date().toISOString();
}

// ---- Service ---------------------------------------------------------------

export interface ServiceRow {
  id: number | string;
  slug: string;
  name: string;
  description: string | null;
  category_id: number | null;
  category?: { slug: string } | null;
  price_minor: number;
  currency: string;
  image_key: string | null;
  status: string | null;
  is_active: boolean;
  server: string | null;
  duration: string | null;
  options: ServiceOption[] | null;
  preferred_time: string | null;
  estimated_completion: string | null;
  customer_instructions: string | null;
  orders_count: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function rowToService(row: ServiceRow): Service {
  const status = (row.status ?? (row.is_active ? 'active' : 'draft')) as ServiceStatus;
  return {
    id: String(row.id),
    slug: row.slug,
    name: row.name,
    category: toCategory(row.category?.slug),
    description: row.description ?? '',
    priceMinor: row.price_minor ?? 0,
    currency: (row.currency as CurrencyCode) ?? 'MYR',
    imageKey: row.image_key,
    status,
    server: (row.server as Service['server']) ?? 'global',
    duration: (row.duration as Service['duration']) ?? '1d',
    options: Array.isArray(row.options) ? row.options : [],
    preferredTime: row.preferred_time,
    estimatedCompletion: row.estimated_completion ?? '',
    customerInstructions: row.customer_instructions ?? '',
    ordersCount: row.orders_count ?? 0,
    updatedAt: iso(row.updated_at),
    createdAt: iso(row.created_at),
  };
}

/** Columns to write for an insert/update. `category_id` is resolved by the handler. */
export function serviceInputToRow(
  input: ServiceInput,
  categoryId: number | null,
): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description,
    category_id: categoryId,
    price_minor: input.priceMinor,
    currency: input.currency,
    image_key: input.imageKey,
    status: input.status,
    // Keep the customer catalogue's is_active flag in sync with admin status.
    is_active: input.status === 'active',
    server: input.server,
    duration: input.duration,
    options: input.options,
    preferred_time: input.preferredTime,
    estimated_completion: input.estimatedCompletion,
    customer_instructions: input.customerInstructions,
  };
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `service-${Date.now()}`
  );
}

// ---- Voucher ---------------------------------------------------------------

/**
 * A voucher is a free-service reward backed by the `reward_items` table.
 */
export interface VoucherRow {
  id: number | string;
  name: string;
  description: string | null;
  service_id: number | null;
  service?: { name: string | null; image_key: string | null } | null;
  points_cost: number;
  image_key: string | null;
  is_available: boolean;
  sort: number | null;
  created_at: string | null;
}

export function deriveVoucherStatus(v: Pick<Voucher, 'available'>): VoucherStatus {
  return v.available ? 'available' : 'unavailable';
}

export function rowToVoucher(row: VoucherRow): VoucherWithStatus {
  const v: Voucher = {
    id: String(row.id),
    name: row.name,
    description: row.description ?? '',
    serviceId: row.service_id != null ? String(row.service_id) : null,
    serviceName: row.service?.name ?? null,
    pointsCost: row.points_cost ?? 0,
    imageKey: row.image_key ?? row.service?.image_key ?? null,
    available: row.is_available ?? false,
    sort: row.sort ?? 0,
    createdAt: iso(row.created_at),
  };
  return { ...v, status: deriveVoucherStatus(v) };
}

export function voucherInputToRow(input: VoucherInput): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description,
    service_id: input.serviceId,
    points_cost: input.pointsCost,
    image_key: input.imageKey,
    is_available: input.available,
  };
}

// ---- Guardian --------------------------------------------------------------

export interface GuardianRow {
  id: number | string;
  name: string;
  avatar_key: string | null;
  online: boolean;
  active_orders: number;
  joined_at: string | null;
}

export function rowToGuardian(row: GuardianRow): Guardian {
  return {
    id: String(row.id),
    name: row.name,
    avatarKey: row.avatar_key,
    online: row.online ?? false,
    activeOrders: row.active_orders ?? 0,
    joinedAt: iso(row.joined_at),
  };
}

// ---- Order -----------------------------------------------------------------

export interface OrderEventRow {
  id: number | string;
  label: string;
  description: string | null;
  state: string;
  happened_at: string | null;
}

export interface OrderRow {
  id: number | string;
  order_code: string;
  user?: { name: string | null; email: string | null } | null;
  contact_name: string | null;
  service_id: number | null;
  service_name: string;
  service_tagline: string | null;
  service_image_key: string | null;
  service?: { category?: { slug: string } | null } | null;
  config: OrderConfigItem[] | null;
  currency: string;
  amount_minor: number;
  payment_status: string | null;
  fulfillment_status: string | null;
  guardian_id: number | null;
  guardian?: { name: string | null } | null;
  guardian_name: string | null;
  assigned_staff_id: string | null;
  assigned_staff_email: string | null;
  assigned_by_id: string | null;
  assigned_by_email: string | null;
  assigned_at: string | null;
  progress_current: number | null;
  progress_target: number | null;
  progress_unit: string | null;
  subtotal_minor: number | null;
  discount_minor: number | null;
  refund_minor: number | null;
  total_minor: number | null;
  internal_notes: string | null;
  before_screenshot: string | null;
  after_screenshot: string | null;
  events?: OrderEventRow[];
  created_at: string | null;
  paid_at: string | null;
  completed_at: string | null;
}

function rowToEvent(row: OrderEventRow): OrderEvent {
  const state = row.state === 'done' || row.state === 'current' ? row.state : 'pending';
  return {
    id: String(row.id),
    label: row.label,
    description: row.description,
    state,
    happenedAt: row.happened_at,
  };
}

export function rowToOrder(row: OrderRow): Order {
  const subtotal = row.subtotal_minor ?? row.amount_minor ?? 0;
  return {
    id: String(row.id),
    code: row.order_code,
    traveler: {
      name: row.user?.name ?? row.contact_name ?? '—',
      email: row.user?.email ?? '',
    },
    serviceId: row.service_id != null ? String(row.service_id) : null,
    serviceName: row.service_name,
    serviceTagline: row.service_tagline,
    serviceImageKey: row.service_image_key,
    category: row.service?.category?.slug ?? '',
    config: Array.isArray(row.config) ? row.config : [],
    currency: (row.currency as CurrencyCode) ?? 'MYR',
    amountMinor: row.amount_minor ?? 0,
    paymentStatus: (row.payment_status as Order['paymentStatus']) ?? 'pending',
    fulfillmentStatus: (row.fulfillment_status as Order['fulfillmentStatus']) ?? 'pending',
    guardianId: row.guardian_id != null ? String(row.guardian_id) : null,
    guardianName: row.guardian?.name ?? row.guardian_name ?? null,
    assignment: row.assigned_staff_id
      ? {
          staffId: row.assigned_staff_id,
          staffEmail: row.assigned_staff_email,
          assignedById: row.assigned_by_id,
          assignedByEmail: row.assigned_by_email,
          assignedAt: row.assigned_at,
        }
      : null,
    progress: {
      current: row.progress_current ?? 0,
      target: row.progress_target ?? 0,
      unit: row.progress_unit ?? '',
    },
    breakdown: {
      subtotalMinor: subtotal,
      discountMinor: row.discount_minor ?? 0,
      refundMinor: row.refund_minor ?? 0,
      totalMinor: row.total_minor ?? row.amount_minor ?? 0,
    },
    events: Array.isArray(row.events) ? row.events.map(rowToEvent) : [],
    internalNotes: row.internal_notes ?? '',
    beforeScreenshot: row.before_screenshot,
    afterScreenshot: row.after_screenshot,
    createdAt: iso(row.created_at),
    paidAt: row.paid_at,
    completedAt: row.completed_at,
  };
}
