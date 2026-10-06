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
  StaffOption,
  VoucherInput,
} from '@/types';
import type { AdminApi, VoucherWithStatus } from './AdminApi';
import type { OrderQuery, ScreenshotSlot, ServiceQuery, VoucherQuery } from './types';

/**
 * Real data source: forwards each AdminApi call to a Next.js route handler under
 * `/api/admin/**`, which talks to Supabase with the server-only secret key.
 * Keeps the secret off the client while preserving the AdminApi contract, so no
 * page/component changes are needed to switch away from the mock adapter.
 */

const BASE = '/api/admin';

function qs(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '' || v === 'all') continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : '';
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return (await res.json()) as T;
}

const post = (path: string, body?: unknown) =>
  req(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
const put = (path: string, body: unknown) =>
  req(path, { method: 'PUT', body: JSON.stringify(body) });
const patch = (path: string, body: unknown) =>
  req(path, { method: 'PATCH', body: JSON.stringify(body) });

export const httpAdapter: AdminApi = {
  // Dashboard
  getDashboard: (currency: CurrencyCode) =>
    req<DashboardMetrics>(`/dashboard${qs({ currency })}`),

  // Services
  listServices: (query: ServiceQuery = {}) =>
    req<Paginated<Service>>(`/services${qs({ ...query })}`),
  getService: (id: string) => req<Service | null>(`/services/${id}`),
  createService: (input: ServiceInput) => post(`/services`, input) as Promise<Service>,
  updateService: (id: string, input: ServiceInput) =>
    put(`/services/${id}`, input) as Promise<Service>,
  setServiceStatus: (id: string, status: ServiceStatus) =>
    patch(`/services/${id}/status`, { status }) as Promise<Service>,
  archiveServices: async (ids: string[]) => {
    await post(`/services/archive`, { ids });
  },

  // Vouchers
  listVouchers: (query: VoucherQuery = {}) =>
    req<VoucherWithStatus[]>(`/vouchers${qs({ ...query })}`),
  getVoucher: (id: string) => req<VoucherWithStatus | null>(`/vouchers/${id}`),
  createVoucher: (input: VoucherInput) =>
    post(`/vouchers`, input) as Promise<VoucherWithStatus>,
  updateVoucher: (id: string, input: VoucherInput) =>
    put(`/vouchers/${id}`, input) as Promise<VoucherWithStatus>,
  deleteVoucher: async (id: string) => {
    await req(`/vouchers/${id}`, { method: 'DELETE' });
  },

  // Guardians
  listGuardians: () => req<Guardian[]>(`/guardians`),

  // Staff
  listStaff: () => req<StaffOption[]>(`/staff`),

  // Orders
  listOrders: (query: OrderQuery = {}) => req<Paginated<Order>>(`/orders${qs({ ...query })}`),
  getOrder: (id: string) => req<Order | null>(`/orders/${id}`),
  assignGuardian: (orderId: string, guardianId: string) =>
    patch(`/orders/${orderId}/guardian`, { guardianId }) as Promise<Order>,
  assignStaff: (orderId: string, staffId: string | null) =>
    patch(`/orders/${orderId}/assignee`, { staffId }) as Promise<Order>,
  updateFulfillment: (orderId: string, status: FulfillmentStatus) =>
    patch(`/orders/${orderId}/fulfillment`, { status }) as Promise<Order>,
  completeOrder: (orderId: string) => post(`/orders/${orderId}/complete`) as Promise<Order>,
  cancelOrder: (orderId: string) => post(`/orders/${orderId}/cancel`) as Promise<Order>,
  requestRefund: (orderId: string) => post(`/orders/${orderId}/refund`) as Promise<Order>,
  saveInternalNote: (orderId: string, note: string) =>
    patch(`/orders/${orderId}/note`, { note }) as Promise<Order>,
  setScreenshot: (orderId: string, slot: ScreenshotSlot, url: string | null) =>
    post(`/orders/${orderId}/screenshot`, { slot, url }) as Promise<Order>,

  // Reports
  getReport: (currency: CurrencyCode) => req<ReportSummary>(`/reports${qs({ currency })}`),
};
