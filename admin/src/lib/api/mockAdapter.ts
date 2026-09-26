import type {
  CurrencyCode,
  DashboardMetrics,
  FulfillmentStatus,
  Guardian,
  Order,
  Paginated,
  ReportSummary,
  Service,
  ServiceInput,
  ServiceStatus,
  Voucher,
  VoucherInput,
} from '@/types';
import { mockServices } from '@/lib/mock/services';
import { mockGuardians } from '@/lib/mock/guardians';
import { mockVouchers, deriveVoucherStatus } from '@/lib/mock/vouchers';
import { mockOrders } from '@/lib/mock/orders';
import { mockReports } from '@/lib/mock/reports';
import { mockDashboard } from '@/lib/mock/dashboard';
import type { AdminApi, VoucherWithStatus } from './AdminApi';
import type { OrderQuery, ScreenshotSlot, ServiceQuery, VoucherQuery } from './types';

/** Simulated network latency so pages exercise real loading states. */
const LATENCY_MS = 320;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

// ---- In-memory store (mutations persist for the browser session) ----------
interface Store {
  services: Service[];
  guardians: Guardian[];
  vouchers: Voucher[];
  orders: Order[];
}

const store: Store = {
  services: clone(mockServices),
  guardians: clone(mockGuardians),
  vouchers: clone(mockVouchers),
  orders: clone(mockOrders),
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function withStatus(v: Voucher): VoucherWithStatus {
  return { ...v, status: deriveVoucherStatus(v) };
}

function paginate<T>(rows: T[], page = 1, perPage = 10): Paginated<T> {
  const start = (page - 1) * perPage;
  return {
    data: rows.slice(start, start + perPage),
    page,
    perPage,
    total: rows.length,
  };
}

export const mockAdapter: AdminApi = {
  // Dashboard ---------------------------------------------------------------
  async getDashboard(currency: CurrencyCode): Promise<DashboardMetrics> {
    return delay(clone(mockDashboard[currency]));
  },

  // Services ----------------------------------------------------------------
  async listServices(query: ServiceQuery = {}): Promise<Paginated<Service>> {
    const { search = '', category = 'all', status = 'all', page = 1, perPage = 10 } = query;
    const term = search.trim().toLowerCase();
    let rows = store.services.filter((s) => s.status !== 'archived');
    if (term) {
      rows = rows.filter(
        (s) => s.name.toLowerCase().includes(term) || s.category.toLowerCase().includes(term),
      );
    }
    if (category !== 'all') rows = rows.filter((s) => s.category === category);
    if (status !== 'all') rows = rows.filter((s) => s.status === status);
    rows = rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return delay(paginate(clone(rows), page, perPage));
  },

  async getService(id: string): Promise<Service | null> {
    return delay(clone(store.services.find((s) => s.id === id) ?? null));
  },

  async createService(input: ServiceInput): Promise<Service> {
    const now = new Date().toISOString();
    const service: Service = {
      ...input,
      id: `svc-${Date.now()}`,
      slug: slugify(input.name) || `service-${Date.now()}`,
      ordersCount: 0,
      updatedAt: now,
      createdAt: now,
    };
    store.services.unshift(service);
    return delay(clone(service));
  },

  async updateService(id: string, input: ServiceInput): Promise<Service> {
    const idx = store.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Service ${id} not found`);
    store.services[idx] = {
      ...store.services[idx],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    return delay(clone(store.services[idx]));
  },

  async setServiceStatus(id: string, status: ServiceStatus): Promise<Service> {
    const idx = store.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Service ${id} not found`);
    store.services[idx].status = status;
    store.services[idx].updatedAt = new Date().toISOString();
    return delay(clone(store.services[idx]));
  },

  async archiveServices(ids: string[]): Promise<void> {
    const set = new Set(ids);
    store.services.forEach((s) => {
      if (set.has(s.id)) {
        s.status = 'archived';
        s.updatedAt = new Date().toISOString();
      }
    });
    return delay(undefined);
  },

  // Vouchers ----------------------------------------------------------------
  async listVouchers(query: VoucherQuery = {}): Promise<VoucherWithStatus[]> {
    const { search = '', status = 'all' } = query;
    const term = search.trim().toLowerCase();
    let rows = store.vouchers.map(withStatus);
    if (term) {
      rows = rows.filter(
        (v) => v.code.toLowerCase().includes(term) || v.internalName.toLowerCase().includes(term),
      );
    }
    if (status !== 'all') rows = rows.filter((v) => v.status === status);
    return delay(clone(rows));
  },

  async getVoucher(id: string): Promise<VoucherWithStatus | null> {
    const found = store.vouchers.find((v) => v.id === id);
    return delay(found ? clone(withStatus(found)) : null);
  },

  async createVoucher(input: VoucherInput): Promise<VoucherWithStatus> {
    const voucher: Voucher = { ...input, id: `vch-${Date.now()}`, usedCount: 0 };
    store.vouchers.unshift(voucher);
    return delay(clone(withStatus(voucher)));
  },

  async updateVoucher(id: string, input: VoucherInput): Promise<VoucherWithStatus> {
    const idx = store.vouchers.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error(`Voucher ${id} not found`);
    store.vouchers[idx] = { ...store.vouchers[idx], ...input };
    return delay(clone(withStatus(store.vouchers[idx])));
  },

  // Guardians ---------------------------------------------------------------
  async listGuardians(): Promise<Guardian[]> {
    return delay(clone(store.guardians));
  },

  // Orders ------------------------------------------------------------------
  async listOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
    const {
      search = '',
      serviceId = 'all',
      guardianId = 'all',
      currency = 'all',
      paymentStatus = 'all',
      fulfillmentStatus = 'all',
      dateFrom,
      dateTo,
      page = 1,
      perPage = 10,
    } = query;
    const term = search.trim().toLowerCase();
    let rows = [...store.orders];
    if (term) {
      rows = rows.filter(
        (o) =>
          o.code.toLowerCase().includes(term) ||
          o.traveler.name.toLowerCase().includes(term) ||
          o.traveler.email.toLowerCase().includes(term),
      );
    }
    if (serviceId !== 'all') rows = rows.filter((o) => o.serviceId === serviceId);
    if (guardianId !== 'all') rows = rows.filter((o) => o.guardianId === guardianId);
    if (currency !== 'all') rows = rows.filter((o) => o.currency === currency);
    if (paymentStatus !== 'all') rows = rows.filter((o) => o.paymentStatus === paymentStatus);
    if (fulfillmentStatus !== 'all')
      rows = rows.filter((o) => o.fulfillmentStatus === fulfillmentStatus);
    if (dateFrom) rows = rows.filter((o) => o.createdAt >= dateFrom);
    if (dateTo) rows = rows.filter((o) => o.createdAt <= `${dateTo}T23:59:59+08:00`);
    rows = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return delay(paginate(clone(rows), page, perPage));
  },

  async getOrder(id: string): Promise<Order | null> {
    const found = store.orders.find((o) => o.id === id || o.code === `#${id}`);
    return delay(found ? clone(found) : null);
  },

  async assignGuardian(orderId: string, guardianId: string): Promise<Order> {
    const order = requireOrder(orderId);
    const guardian = store.guardians.find((g) => g.id === guardianId);
    order.guardianId = guardianId;
    order.guardianName = guardian?.name ?? null;
    if (order.fulfillmentStatus === 'awaiting_guardian') order.fulfillmentStatus = 'in_progress';
    pushEvent(order, 'Guardian assigned', `Order assigned to ${guardian?.name ?? 'Guardian'}.`);
    return delay(clone(order));
  },

  async updateFulfillment(orderId: string, status: FulfillmentStatus): Promise<Order> {
    const order = requireOrder(orderId);
    order.fulfillmentStatus = status;
    pushEvent(order, 'Status updated', `Fulfillment set to ${status.replace('_', ' ')}.`);
    return delay(clone(order));
  },

  async completeOrder(orderId: string): Promise<Order> {
    const order = requireOrder(orderId);
    order.fulfillmentStatus = 'completed';
    order.progress.current = order.progress.target;
    order.completedAt = new Date().toISOString();
    markTimelineDone(order);
    pushEvent(order, 'Order completed', 'Marked as completed by admin.', 'done');
    return delay(clone(order));
  },

  async cancelOrder(orderId: string): Promise<Order> {
    const order = requireOrder(orderId);
    order.fulfillmentStatus = 'cancelled';
    pushEvent(order, 'Order cancelled', 'Cancelled by admin.', 'done');
    return delay(clone(order));
  },

  async requestRefund(orderId: string): Promise<Order> {
    const order = requireOrder(orderId);
    order.paymentStatus = 'refunded';
    order.breakdown.refundMinor = order.breakdown.subtotalMinor - order.breakdown.discountMinor;
    order.breakdown.totalMinor = 0;
    pushEvent(order, 'Refund requested', 'Refund requested by admin (demo).', 'done');
    return delay(clone(order));
  },

  async saveInternalNote(orderId: string, note: string): Promise<Order> {
    const order = requireOrder(orderId);
    order.internalNotes = note;
    return delay(clone(order));
  },

  async setScreenshot(orderId: string, slot: ScreenshotSlot, url: string | null): Promise<Order> {
    const order = requireOrder(orderId);
    if (slot === 'before') order.beforeScreenshot = url;
    else order.afterScreenshot = url;
    return delay(clone(order));
  },

  // Reports -----------------------------------------------------------------
  async getReport(currency: CurrencyCode): Promise<ReportSummary> {
    return delay(clone(mockReports[currency]));
  },
};

// ---- internal mutation helpers -------------------------------------------
function requireOrder(orderId: string): Order {
  const order = store.orders.find((o) => o.id === orderId || o.code === `#${orderId}`);
  if (!order) throw new Error(`Order ${orderId} not found`);
  return order;
}

function markTimelineDone(order: Order): void {
  order.events.forEach((e) => {
    if (e.state === 'current') e.state = 'done';
  });
}

function pushEvent(
  order: Order,
  label: string,
  description: string,
  state: Order['events'][number]['state'] = 'current',
): void {
  markTimelineDone(order);
  order.events.push({
    id: `ev-${Date.now()}`,
    label,
    description,
    state,
    happenedAt: new Date().toISOString(),
  });
}
