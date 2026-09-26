import type {
  DashboardMetrics,
  Guardian,
  Order,
  Paginated,
  ReportSummary,
  Service,
  ServiceInput,
  ServiceStatus,
  CurrencyCode,
  FulfillmentStatus,
  Voucher,
  VoucherInput,
  VoucherStatus,
} from '@/types';
import type { OrderQuery, ScreenshotSlot, ServiceQuery, VoucherQuery } from './types';

/**
 * The single contract every data source (mock now, Laravel later) implements.
 * Pages consume `api` from `./index` and never touch mock arrays directly, so
 * swapping the implementation is a one-line change in `./index`.
 *
 * See BACKEND.md for the matching Laravel endpoints and payload shapes.
 */
export interface AdminApi {
  // Dashboard ---------------------------------------------------------------
  getDashboard(currency: CurrencyCode): Promise<DashboardMetrics>;

  // Services ----------------------------------------------------------------
  listServices(query?: ServiceQuery): Promise<Paginated<Service>>;
  getService(id: string): Promise<Service | null>;
  createService(input: ServiceInput): Promise<Service>;
  updateService(id: string, input: ServiceInput): Promise<Service>;
  setServiceStatus(id: string, status: ServiceStatus): Promise<Service>;
  archiveServices(ids: string[]): Promise<void>;

  // Vouchers ----------------------------------------------------------------
  listVouchers(query?: VoucherQuery): Promise<VoucherWithStatus[]>;
  getVoucher(id: string): Promise<VoucherWithStatus | null>;
  createVoucher(input: VoucherInput): Promise<VoucherWithStatus>;
  updateVoucher(id: string, input: VoucherInput): Promise<VoucherWithStatus>;

  // Guardians ---------------------------------------------------------------
  listGuardians(): Promise<Guardian[]>;

  // Orders ------------------------------------------------------------------
  listOrders(query?: OrderQuery): Promise<Paginated<Order>>;
  getOrder(id: string): Promise<Order | null>;
  assignGuardian(orderId: string, guardianId: string): Promise<Order>;
  updateFulfillment(orderId: string, status: FulfillmentStatus): Promise<Order>;
  completeOrder(orderId: string): Promise<Order>;
  cancelOrder(orderId: string): Promise<Order>;
  requestRefund(orderId: string): Promise<Order>;
  saveInternalNote(orderId: string, note: string): Promise<Order>;
  /** Records a LOCAL preview URL only — no upload happens in mock mode. */
  setScreenshot(orderId: string, slot: ScreenshotSlot, url: string | null): Promise<Order>;

  // Reports -----------------------------------------------------------------
  getReport(currency: CurrencyCode): Promise<ReportSummary>;
}

/** Voucher enriched with its derived lifecycle status. */
export interface VoucherWithStatus extends Voucher {
  status: VoucherStatus;
}
