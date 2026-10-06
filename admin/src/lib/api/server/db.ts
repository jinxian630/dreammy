import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
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
  StatusSlice,
  TrendPoint,
  VoucherInput,
} from '@/types';
import type { Member } from '@/lib/auth/session';
import { normalizeRole } from '@/lib/auth/roles';
import type { VoucherWithStatus } from '../AdminApi';
import type { OrderQuery, ScreenshotSlot, ServiceQuery, VoucherQuery } from '../types';
import {
  rowToGuardian,
  rowToOrder,
  rowToService,
  rowToVoucher,
  serviceInputToRow,
  slugify,
  voucherInputToRow,
  type GuardianRow,
  type OrderRow,
  type ServiceRow,
  type VoucherRow,
} from '../mappers';

const SERVICE_SELECT = '*, category:categories(slug)';
const ORDER_SELECT =
  '*, user:users(name,email), service:services(category:categories(slug)), guardian:guardians(name), events:order_events(*)';

// ---- category helpers ------------------------------------------------------

async function categorySlugToId(slug: string): Promise<number | null> {
  const { data } = await supabaseAdmin()
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  return (data?.id as number) ?? null;
}

// ---- Services --------------------------------------------------------------

export async function listServices(query: ServiceQuery = {}): Promise<Paginated<Service>> {
  const { search = '', category = 'all', status = 'all', page = 1, perPage = 10 } = query;
  const sb = supabaseAdmin();
  let q = sb.from('services').select(SERVICE_SELECT, { count: 'exact' });

  if (status === 'all') q = q.neq('status', 'archived');
  else q = q.eq('status', status);
  if (category !== 'all') {
    const categoryId = await categorySlugToId(category);
    // No such category → no rows (use an impossible id rather than a bad filter).
    q = q.eq('category_id', categoryId ?? -1);
  }
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    q = q.or(`name.ilike.${term},slug.ilike.${term}`);
  }

  const from = (page - 1) * perPage;
  q = q.order('updated_at', { ascending: false }).range(from, from + perPage - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  return {
    data: (data as unknown as ServiceRow[]).map(rowToService),
    page,
    perPage,
    total: count ?? 0,
  };
}

export async function getService(id: string): Promise<Service | null> {
  const { data, error } = await supabaseAdmin()
    .from('services')
    .select(SERVICE_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToService(data as unknown as ServiceRow) : null;
}

export async function createService(input: ServiceInput): Promise<Service> {
  const sb = supabaseAdmin();
  const categoryId = await categorySlugToId(input.category);
  const row = serviceInputToRow(input, categoryId);
  row.slug = `${slugify(input.name)}-${Date.now().toString(36)}`;
  const { data, error } = await sb.from('services').insert(row).select(SERVICE_SELECT).single();
  if (error) throw new Error(error.message);
  return rowToService(data as unknown as ServiceRow);
}

export async function updateService(id: string, input: ServiceInput): Promise<Service> {
  const sb = supabaseAdmin();
  const categoryId = await categorySlugToId(input.category);
  const row = serviceInputToRow(input, categoryId);
  const { data, error } = await sb
    .from('services')
    .update(row)
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToService(data as unknown as ServiceRow);
}

export async function setServiceStatus(id: string, status: ServiceStatus): Promise<Service> {
  const { data, error } = await supabaseAdmin()
    .from('services')
    .update({ status, is_active: status === 'active' })
    .eq('id', id)
    .select(SERVICE_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToService(data as unknown as ServiceRow);
}

export async function archiveServices(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabaseAdmin()
    .from('services')
    .update({ status: 'archived', is_active: false })
    .in('id', ids);
  if (error) throw new Error(error.message);
}

// ---- Vouchers (free-service rewards, backed by `reward_items`) -------------

const REWARD_SELECT = '*, service:services(name,image_key)';

/** When no image is chosen, fall back to the linked service's image. */
async function resolveVoucherImage(input: VoucherInput): Promise<string | null> {
  if (input.imageKey || !input.serviceId) return input.imageKey;
  const { data } = await supabaseAdmin()
    .from('services')
    .select('image_key')
    .eq('id', input.serviceId)
    .maybeSingle();
  return (data?.image_key as string | null) ?? null;
}

export async function listVouchers(query: VoucherQuery = {}): Promise<VoucherWithStatus[]> {
  const { search = '', status = 'all' } = query;
  const sb = supabaseAdmin();
  let q = sb.from('reward_items').select(REWARD_SELECT);
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    q = q.or(`name.ilike.${term},description.ilike.${term}`);
  }
  q = q.order('sort', { ascending: true });
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  let rows = (data as unknown as VoucherRow[]).map(rowToVoucher);
  if (status !== 'all') rows = rows.filter((v) => v.status === status);
  return rows;
}

export async function getVoucher(id: string): Promise<VoucherWithStatus | null> {
  const { data, error } = await supabaseAdmin()
    .from('reward_items')
    .select(REWARD_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToVoucher(data as unknown as VoucherRow) : null;
}

export async function createVoucher(input: VoucherInput): Promise<VoucherWithStatus> {
  const imageKey = await resolveVoucherImage(input);
  const { data, error } = await supabaseAdmin()
    .from('reward_items')
    // band 'B' (margin) avoids the Band-C monthly cap in PointsService::redeem.
    .insert({ ...voucherInputToRow({ ...input, imageKey }), band: 'B', sort: 0 })
    .select(REWARD_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToVoucher(data as unknown as VoucherRow);
}

export async function updateVoucher(id: string, input: VoucherInput): Promise<VoucherWithStatus> {
  const imageKey = await resolveVoucherImage(input);
  const { data, error } = await supabaseAdmin()
    .from('reward_items')
    .update(voucherInputToRow({ ...input, imageKey }))
    .eq('id', id)
    .select(REWARD_SELECT)
    .single();
  if (error) throw new Error(error.message);
  return rowToVoucher(data as unknown as VoucherRow);
}

export async function deleteVoucher(id: string): Promise<void> {
  // point_transactions.reward_item_id is ON DELETE SET NULL, so existing
  // redemption history is preserved.
  const { error } = await supabaseAdmin().from('reward_items').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

// ---- Guardians -------------------------------------------------------------

export async function listGuardians(): Promise<Guardian[]> {
  const { data, error } = await supabaseAdmin()
    .from('guardians')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as GuardianRow[]).map(rowToGuardian);
}

// ---- Orders ----------------------------------------------------------------

export async function listOrders(query: OrderQuery = {}): Promise<Paginated<Order>> {
  const {
    search = '',
    serviceId = 'all',
    guardianId = 'all',
    assignedStaffId = 'all',
    currency = 'all',
    paymentStatus = 'all',
    fulfillmentStatus = 'all',
    dateFrom,
    dateTo,
    page = 1,
    perPage = 10,
  } = query;
  const sb = supabaseAdmin();
  let q = sb.from('orders').select(ORDER_SELECT, { count: 'exact' });

  if (serviceId !== 'all') q = q.eq('service_id', serviceId);
  if (guardianId !== 'all') q = q.eq('guardian_id', guardianId);
  if (assignedStaffId === 'unassigned') q = q.is('assigned_staff_id', null);
  else if (assignedStaffId !== 'all') q = q.eq('assigned_staff_id', assignedStaffId);
  if (currency !== 'all') q = q.eq('currency', currency);
  if (paymentStatus !== 'all') q = q.eq('payment_status', paymentStatus);
  if (fulfillmentStatus !== 'all') q = q.eq('fulfillment_status', fulfillmentStatus);
  if (dateFrom) q = q.gte('created_at', dateFrom);
  if (dateTo) q = q.lte('created_at', `${dateTo}T23:59:59+08:00`);
  if (search.trim()) {
    const term = `%${search.trim()}%`;
    q = q.or(`order_code.ilike.${term},service_name.ilike.${term},contact_name.ilike.${term}`);
  }

  const from = (page - 1) * perPage;
  q = q.order('created_at', { ascending: false }).range(from, from + perPage - 1);

  const { data, count, error } = await q;
  if (error) throw new Error(error.message);
  return {
    data: (data as unknown as OrderRow[]).map(rowToOrder),
    page,
    perPage,
    total: count ?? 0,
  };
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabaseAdmin()
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToOrder(data as unknown as OrderRow) : null;
}

async function pushEvent(orderId: string, label: string, description: string, state = 'current') {
  const sb = supabaseAdmin();
  // Previous "current" events become "done".
  await sb.from('order_events').update({ state: 'done' }).eq('order_id', orderId).eq('state', 'current');
  await sb.from('order_events').insert({
    order_id: orderId,
    label,
    description,
    state,
    happened_at: new Date().toISOString(),
  });
}

export async function assignGuardian(orderId: string, guardianId: string): Promise<Order> {
  const sb = supabaseAdmin();
  const current = await getOrder(orderId);
  const patch: Record<string, unknown> = { guardian_id: guardianId };
  if (current?.fulfillmentStatus === 'awaiting_guardian') patch.fulfillment_status = 'in_progress';
  const { error } = await sb.from('orders').update(patch).eq('id', orderId);
  if (error) throw new Error(error.message);
  const { data: g } = await sb.from('guardians').select('name').eq('id', guardianId).maybeSingle();
  await pushEvent(orderId, 'Guardian assigned', `Order assigned to ${g?.name ?? 'Guardian'}.`);
  return (await getOrder(orderId))!;
}

/**
 * Assign (or clear) the internal team member responsible for an order.
 * `staffId` is a team member's Supabase auth user id, or null to unassign.
 * `actor` is the signed-in member performing the action (recorded as assigned_by).
 */
export async function assignStaff(
  orderId: string,
  staffId: string | null,
  actor: Member,
): Promise<Order> {
  const sb = supabaseAdmin();
  const now = new Date().toISOString();

  if (!staffId) {
    const { error } = await sb
      .from('orders')
      .update({
        assigned_staff_id: null,
        assigned_staff_email: null,
        assigned_by_id: actor.userId,
        assigned_by_email: actor.email,
        assigned_at: now,
      })
      .eq('id', orderId);
    if (error) throw new Error(error.message);
    await pushEvent(orderId, 'Task unassigned', `Assignment cleared by ${actor.email}.`);
    return (await getOrder(orderId))!;
  }

  const { data: staff } = await sb
    .from('team_members')
    .select('email')
    .eq('user_id', staffId)
    .maybeSingle();
  const staffEmail = (staff?.email as string) ?? '';

  const { error } = await sb
    .from('orders')
    .update({
      assigned_staff_id: staffId,
      assigned_staff_email: staffEmail,
      assigned_by_id: actor.userId,
      assigned_by_email: actor.email,
      assigned_at: now,
    })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  await pushEvent(
    orderId,
    'Task assigned',
    `Assigned to ${staffEmail || 'staff'} by ${actor.email}.`,
  );
  return (await getOrder(orderId))!;
}

/** Active team members that can be assigned to an order (have a linked auth user). */
export async function listStaff(): Promise<StaffOption[]> {
  const { data, error } = await supabaseAdmin()
    .from('team_members')
    .select('user_id, email, role')
    .eq('status', 'active')
    .not('user_id', 'is', null)
    .order('email', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as { user_id: string; email: string; role: string }[]).map((r) => ({
    userId: r.user_id,
    email: r.email,
    role: normalizeRole(r.role),
  }));
}

export async function updateFulfillment(orderId: string, status: FulfillmentStatus): Promise<Order> {
  const sb = supabaseAdmin();
  const { error } = await sb.from('orders').update({ fulfillment_status: status }).eq('id', orderId);
  if (error) throw new Error(error.message);
  await pushEvent(orderId, 'Status updated', `Fulfillment set to ${status.replace('_', ' ')}.`);
  return (await getOrder(orderId))!;
}

export async function completeOrder(orderId: string): Promise<Order> {
  const sb = supabaseAdmin();
  const current = await getOrder(orderId);
  const { error } = await sb
    .from('orders')
    .update({
      fulfillment_status: 'completed',
      progress_current: current?.progress.target ?? 0,
      completed_at: new Date().toISOString(),
    })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  await pushEvent(orderId, 'Order completed', 'Marked as completed by admin.', 'done');
  return (await getOrder(orderId))!;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const sb = supabaseAdmin();
  const { error } = await sb.from('orders').update({ fulfillment_status: 'cancelled' }).eq('id', orderId);
  if (error) throw new Error(error.message);
  await pushEvent(orderId, 'Order cancelled', 'Cancelled by admin.', 'done');
  return (await getOrder(orderId))!;
}

export async function requestRefund(orderId: string): Promise<Order> {
  const sb = supabaseAdmin();
  const current = await getOrder(orderId);
  const refund = (current?.breakdown.subtotalMinor ?? 0) - (current?.breakdown.discountMinor ?? 0);
  const { error } = await sb
    .from('orders')
    .update({ payment_status: 'refunded', refund_minor: refund, total_minor: 0 })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  await pushEvent(orderId, 'Refund requested', 'Refund requested by admin.', 'done');
  return (await getOrder(orderId))!;
}

export async function saveInternalNote(orderId: string, note: string): Promise<Order> {
  const { error } = await supabaseAdmin()
    .from('orders')
    .update({ internal_notes: note })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  return (await getOrder(orderId))!;
}

export async function setScreenshot(
  orderId: string,
  slot: ScreenshotSlot,
  url: string | null,
): Promise<Order> {
  const column = slot === 'before' ? 'before_screenshot' : 'after_screenshot';
  const { error } = await supabaseAdmin()
    .from('orders')
    .update({ [column]: url })
    .eq('id', orderId);
  if (error) throw new Error(error.message);
  return (await getOrder(orderId))!;
}

// ---- Reports & dashboard ---------------------------------------------------

async function fetchOrdersForCurrency(currency: CurrencyCode): Promise<Order[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from('orders').select(ORDER_SELECT).eq('currency', currency);
  if (error) throw new Error(error.message);
  return (data as unknown as OrderRow[]).map(rowToOrder);
}

function dayLabel(iso: string): { label: string; date: string } {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const label = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return { label, date };
}

export async function getReport(currency: CurrencyCode): Promise<ReportSummary> {
  const orders = await fetchOrdersForCurrency(currency);
  const paid = orders.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'refunded');

  const grossMinor = paid.reduce((s, o) => s + o.breakdown.subtotalMinor, 0);
  const discountsMinor = paid.reduce((s, o) => s + o.breakdown.discountMinor, 0);
  const refundsMinor = paid.reduce((s, o) => s + o.breakdown.refundMinor, 0);
  const netMinor = grossMinor - discountsMinor - refundsMinor;
  const totalOrders = orders.length;
  const paidOrders = paid.length;

  // Daily sales trend.
  const trendMap = new Map<string, TrendPoint>();
  for (const o of paid) {
    const { label, date } = dayLabel(o.createdAt);
    const point = trendMap.get(date) ?? { label, date, value: 0 };
    point.value += o.breakdown.totalMinor;
    trendMap.set(date, point);
  }
  const salesTrend = [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  // Per-service breakdown.
  const svcMap = new Map<string, ReportSummary['serviceBreakdown'][number]>();
  for (const o of paid) {
    const key = o.serviceId ?? o.serviceName;
    const row = svcMap.get(key) ?? {
      serviceId: o.serviceId ?? '',
      serviceName: o.serviceName,
      category: o.category,
      paidOrders: 0,
      grossMinor: 0,
      discountsMinor: 0,
      refundsMinor: 0,
      netMinor: 0,
    };
    row.paidOrders += 1;
    row.grossMinor += o.breakdown.subtotalMinor;
    row.discountsMinor += o.breakdown.discountMinor;
    row.refundsMinor += o.breakdown.refundMinor;
    row.netMinor = row.grossMinor - row.discountsMinor - row.refundsMinor;
    svcMap.set(key, row);
  }

  // Fulfillment distribution donut.
  const tones: Record<string, StatusSlice['tone']> = {
    completed: 'success',
    in_progress: 'info',
    awaiting_guardian: 'lavender',
    pending: 'blush',
    cancelled: 'muted',
  };
  const distMap = new Map<string, number>();
  for (const o of orders) distMap.set(o.fulfillmentStatus, (distMap.get(o.fulfillmentStatus) ?? 0) + 1);
  const statusDistribution: StatusSlice[] = [...distMap.entries()].map(([key, count]) => ({
    key,
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    count,
    percent: totalOrders ? Math.round((count / totalOrders) * 100) : 0,
    tone: tones[key] ?? 'muted',
  }));

  return {
    currency,
    grossMinor,
    discountsMinor,
    refundsMinor,
    netMinor,
    totalOrders,
    paidOrders,
    conversionRate: totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0,
    avgOrderValueMinor: paidOrders ? Math.round(netMinor / paidOrders) : 0,
    salesTrend,
    serviceBreakdown: [...svcMap.values()].sort((a, b) => b.netMinor - a.netMinor),
    statusDistribution,
  };
}

export async function getDashboard(currency: CurrencyCode): Promise<DashboardMetrics> {
  const orders = await fetchOrdersForCurrency(currency);
  const paid = orders.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'refunded');
  const activeStatuses: FulfillmentStatus[] = ['pending', 'awaiting_guardian', 'in_progress'];

  const totalRevenueMinor = paid.reduce((s, o) => s + o.breakdown.totalMinor, 0);
  const activeOrders = orders.filter((o) => activeStatuses.includes(o.fulfillmentStatus)).length;
  const pendingRefunds = orders.filter((o) => o.paymentStatus === 'refunded').length;

  const noDelta = (periodLabel: string) => ({ percent: 0, periodLabel });

  // Revenue trend (by day).
  const trendMap = new Map<string, TrendPoint>();
  for (const o of paid) {
    const { label, date } = dayLabel(o.createdAt);
    const point = trendMap.get(date) ?? { label, date, value: 0 };
    point.value += o.breakdown.totalMinor;
    trendMap.set(date, point);
  }
  const revenueTrend = [...trendMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  // Service sales.
  const salesMap = new Map<string, { label: string; unitsSold: number; revenueMinor: number }>();
  for (const o of paid) {
    const label = o.serviceName;
    const row = salesMap.get(label) ?? { label, unitsSold: 0, revenueMinor: 0 };
    row.unitsSold += 1;
    row.revenueMinor += o.breakdown.totalMinor;
    salesMap.set(label, row);
  }

  const toneFor = (o: Order): 'success' | 'info' | 'warn' | 'muted' =>
    o.fulfillmentStatus === 'completed'
      ? 'success'
      : o.fulfillmentStatus === 'cancelled'
        ? 'muted'
        : o.paymentStatus === 'paid'
          ? 'info'
          : 'warn';

  const recentOrders = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      code: o.code,
      player: o.traveler.name,
      service: o.serviceName,
      amountMinor: o.amountMinor,
      currency: o.currency,
      status: o.fulfillmentStatus.replace(/_/g, ' '),
      statusTone: toneFor(o),
    }));

  return {
    currency,
    totalRevenueMinor,
    revenueDelta: noDelta('vs last period'),
    paidOrders: paid.length,
    paidOrdersDelta: noDelta('vs last period'),
    activeOrders,
    activeOrdersDelta: noDelta('vs last period'),
    pendingRefunds,
    pendingRefundsDelta: noDelta('vs last period'),
    revenueTrend,
    serviceSales: [...salesMap.values()].sort((a, b) => b.revenueMinor - a.revenueMinor),
    recentOrders,
  };
}
