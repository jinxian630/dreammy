'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { CurrencyCode, Guardian, Order, Service } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import { downloadCsv } from '@/lib/csv';
import { ORDER_EXPORT_COLUMNS, buildOrdersCsv } from '@/lib/exports/orderCsv';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { PaymentBadge, FulfillmentBadge } from '@/components/admin/StatusBadge';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { Pagination } from '@/components/admin/Pagination';
import { EmptyState, LoadingRows } from '@/components/admin/States';
import { useToast } from '@/components/ui/Toast';
import {
  IconSearch,
  IconCalendar,
  IconDownload,
  IconChevronRight,
  IconInfo,
  IconClipboard,
} from '@/components/ui/icons';

const PER_PAGE = 10;

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  serviceId: string;
  guardianId: string;
  currency: string;
}

const DEFAULT_FILTERS: Filters = {
  search: '',
  dateFrom: '2026-09-01',
  dateTo: '2026-09-30',
  paymentStatus: 'all',
  fulfillmentStatus: 'all',
  serviceId: 'all',
  guardianId: 'all',
  currency: 'all',
};

export default function OrdersPage() {
  const { notify } = useToast();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [allFiltered, setAllFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<Service[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);

  useEffect(() => {
    api.listServices({ perPage: 999 }).then((r) => setServices(r.data));
    api.listGuardians().then(setGuardians);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const query = {
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      paymentStatus: filters.paymentStatus as never,
      fulfillmentStatus: filters.fulfillmentStatus as never,
      serviceId: filters.serviceId,
      guardianId: filters.guardianId,
      currency: filters.currency as never,
    };
    const [pageData, allData] = await Promise.all([
      api.listOrders({ ...query, page, perPage: PER_PAGE }),
      api.listOrders({ ...query, perPage: 999 }),
    ]);
    setRows(pageData.data);
    setTotal(pageData.total);
    setAllFiltered(allData.data);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) rows.forEach((r) => next.delete(r.id));
      else rows.forEach((r) => next.add(r.id));
      return next;
    });
  }
  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage and track customer orders for your Dreammy store." />

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            leftIcon={<IconSearch width={18} height={18} />}
            placeholder="Search by order ID or traveler name…"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            aria-label="Search orders"
          />
          <div className="flex items-center gap-2">
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} aria-label="Date from" leftIcon={<IconCalendar width={18} height={18} />} />
            <span className="text-ink-muted">–</span>
            <Input type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} aria-label="Date to" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="field-label">Payment status</span>
            <Select value={filters.paymentStatus} onChange={(e) => setFilter('paymentStatus', e.target.value)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </Select>
          </label>
          <label className="block">
            <span className="field-label">Fulfillment status</span>
            <Select value={filters.fulfillmentStatus} onChange={(e) => setFilter('fulfillmentStatus', e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="awaiting_guardian">Awaiting Guardian</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </label>
          <label className="block">
            <span className="field-label">Service</span>
            <Select value={filters.serviceId} onChange={(e) => setFilter('serviceId', e.target.value)}>
              <option value="all">All services</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">Guardian</span>
            <Select value={filters.guardianId} onChange={(e) => setFilter('guardianId', e.target.value)}>
              <option value="all">All guardians</option>
              {guardians.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">Currency</span>
            <Select value={filters.currency} onChange={(e) => setFilter('currency', e.target.value)}>
              <option value="all">All currencies</option>
              <option value="MYR">MYR (RM)</option>
              <option value="CNY">CNY (¥)</option>
            </Select>
          </label>
          <div className="flex items-end gap-2">
            <Button variant="outline" block onClick={() => setFilters(DEFAULT_FILTERS)}>
              Reset filters
            </Button>
            <Button block onClick={load}>
              <IconSearch width={18} height={18} /> Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Order list */}
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-plum">Order list ({total})</h2>
        </div>

        <div className="mt-4">
          {loading ? (
            <LoadingRows />
          ) : rows.length === 0 ? (
            <EmptyState icon={IconClipboard} title="No orders match your filters" description="Try widening the date range or clearing some filters." action={<Button size="sm" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</Button>} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                      <th className="w-8 pb-3">
                        <input type="checkbox" aria-label="Select all" checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
                      </th>
                      <th className="pb-3 font-semibold">Order ID</th>
                      <th className="pb-3 font-semibold">Traveler</th>
                      <th className="pb-3 font-semibold">Service</th>
                      <th className="pb-3 font-semibold">Guardian</th>
                      <th className="pb-3 font-semibold">Total</th>
                      <th className="pb-3 font-semibold">Payment</th>
                      <th className="pb-3 font-semibold">Fulfillment</th>
                      <th className="pb-3 font-semibold">Created</th>
                      <th className="pb-3 font-semibold text-right">View</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blush-soft">
                    {rows.map((o) => (
                      <tr key={o.id}>
                        <td className="py-3">
                          <input type="checkbox" aria-label={`Select ${o.code}`} checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="h-4 w-4 accent-primary" />
                        </td>
                        <td className="py-3 font-semibold text-plum">{o.code}</td>
                        <td className="py-3">
                          <p className="text-ink">{o.traveler.name}</p>
                          <p className="text-xs text-ink-muted">{o.traveler.email}</p>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <ImageSlot imageKey={o.serviceImageKey} ratio="1 / 1" rounded="rounded-lg" className="h-9 w-9 flex-shrink-0" alt={o.serviceName} />
                            <div className="min-w-0">
                              <p className="truncate text-ink">{o.serviceName}</p>
                              {o.serviceTagline && <p className="truncate text-xs text-ink-muted">{o.serviceTagline}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-ink-soft">{o.guardianName ?? '—'}</td>
                        <td className="py-3 font-medium text-ink">{formatMoney(o.amountMinor, o.currency)}</td>
                        <td className="py-3"><PaymentBadge status={o.paymentStatus} /></td>
                        <td className="py-3"><FulfillmentBadge status={o.fulfillmentStatus} /></td>
                        <td className="py-3 text-xs text-ink-soft">{formatDateTime(o.createdAt)}</td>
                        <td className="py-3 text-right">
                          <Link href={`/admin/orders/${o.id}`} aria-label={`View ${o.code}`} className="inline-flex rounded-full p-2 text-primary hover:bg-blush-soft">
                            <IconChevronRight width={18} height={18} />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 lg:hidden">
                {rows.map((o) => (
                  <li key={o.id} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" aria-label={`Select ${o.code}`} checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="mt-1 h-4 w-4 accent-primary" />
                      <Link href={`/admin/orders/${o.id}`} className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-plum">{o.code}</p>
                          <span className="text-xs text-ink-muted">{formatDateTime(o.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink">{o.traveler.name}</p>
                        <p className="text-xs text-ink-muted">{o.traveler.email}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <ImageSlot imageKey={o.serviceImageKey} ratio="1 / 1" rounded="rounded-lg" className="h-8 w-8 flex-shrink-0" alt={o.serviceName} />
                          <span className="truncate text-sm text-ink-soft">{o.serviceName}</span>
                        </div>
                        <p className="mt-1 text-xs text-ink-soft">Guardian: {o.guardianName ?? '—'}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="font-semibold text-ink">{formatMoney(o.amountMinor, o.currency)}</span>
                          <span className="flex gap-1.5">
                            <PaymentBadge status={o.paymentStatus} />
                            <FulfillmentBadge status={o.fulfillmentStatus} />
                          </span>
                        </div>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <Pagination page={page} perPage={PER_PAGE} total={total} onPageChange={setPage} onPerPageChange={() => {}} />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* CSV export */}
      <OrdersExport
        filtered={allFiltered}
        selectedIds={selected}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        onDownloaded={(n) => notify(`Exported ${n} demo order(s) to CSV.`)}
      />
    </div>
  );
}

function OrdersExport({
  filtered,
  selectedIds,
  dateFrom,
  dateTo,
  onDownloaded,
}: {
  filtered: Order[];
  selectedIds: Set<string>;
  dateFrom: string;
  dateTo: string;
  onDownloaded: (count: number) => void;
}) {
  const [scope, setScope] = useState<'all' | 'selected'>('all');
  const [columns, setColumns] = useState<string[]>(
    ORDER_EXPORT_COLUMNS.filter((c) => c.default).map((c) => c.key),
  );
  const [includeContact, setIncludeContact] = useState(false);

  const selectedOrders = useMemo(
    () => filtered.filter((o) => selectedIds.has(o.id)),
    [filtered, selectedIds],
  );
  const exportOrders = scope === 'selected' ? selectedOrders : filtered;

  const effectiveColumns = useMemo(() => {
    const base = columns.filter((k) => {
      const col = ORDER_EXPORT_COLUMNS.find((c) => c.key === k);
      return col && (!col.contact || includeContact);
    });
    // Ensure contact column is present when the toggle is on.
    if (includeContact && !base.includes('email')) base.push('email');
    return base;
  }, [columns, includeContact]);

  function toggleColumn(key: string) {
    setColumns((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  function handleDownload() {
    const csv = buildOrdersCsv(exportOrders, effectiveColumns);
    downloadCsv(`dreammy-orders-demo-${dateFrom}_to_${dateTo}.csv`, csv);
    onDownloaded(exportOrders.length);
  }

  const nonContactColumns = ORDER_EXPORT_COLUMNS.filter((c) => !c.contact);

  return (
    <Card className="mt-5">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
          <IconDownload width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-lg text-plum">Export orders to CSV</h2>
          <p className="text-sm text-ink-soft">
            Export order data based on your current filters. The exported file will include all orders matching the filters above, or only the selected orders.
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-info-soft p-3 text-sm text-info">
        <IconInfo width={18} height={18} className="mt-0.5 flex-shrink-0" />
        <p>
          Export follows your current filters. Currently {filtered.length} order(s) match your filters. Records are <strong>demo data</strong> — not real orders.
        </p>
      </div>

      {/* Scope */}
      <div className="mt-4">
        <span className="field-label">Export scope</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${scope === 'all' ? 'border-primary bg-primary-soft/50' : 'border-blush-deep/40'}`}>
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} className="mt-1 h-4 w-4 accent-primary" />
            <span>
              <span className="block text-sm font-semibold text-plum">All filtered orders ({filtered.length})</span>
              <span className="block text-xs text-ink-soft">Export all orders that match your current filters.</span>
            </span>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${scope === 'selected' ? 'border-primary bg-primary-soft/50' : 'border-blush-deep/40'}`}>
            <input type="radio" name="scope" checked={scope === 'selected'} onChange={() => setScope('selected')} className="mt-1 h-4 w-4 accent-primary" />
            <span>
              <span className="block text-sm font-semibold text-plum">Selected orders ({selectedIds.size})</span>
              <span className="block text-xs text-ink-soft">Export only the selected orders from the table.</span>
            </span>
          </label>
        </div>
      </div>

      {/* Date range display */}
      <div className="mt-4">
        <span className="field-label">Date range (from filters)</span>
        <div className="rounded-2xl border border-blush-soft bg-cream-deep/40 px-3.5 py-3 text-sm text-ink-soft">
          {dateFrom} – {dateTo}
          <span className="ml-2 text-xs text-ink-muted">This export includes orders in this range matching your filters.</span>
        </div>
      </div>

      {/* Column picker */}
      <div className="mt-4">
        <span className="field-label">Select columns to include</span>
        <p className="field-hint mb-2">Choose which fields to include in the exported CSV file.</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {nonContactColumns.map((col) => (
            <label key={col.key} className="inline-flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={columns.includes(col.key)} onChange={() => toggleColumn(col.key)} className="h-4 w-4 accent-primary" />
              {col.header}
            </label>
          ))}
        </div>
      </div>

      {/* Options + format */}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start justify-between gap-3 rounded-2xl border border-blush-soft p-3">
          <div>
            <p className="text-sm font-semibold text-plum">Include customer contact details</p>
            <p className="text-xs text-ink-soft">Include traveler email and other contact information in the export file.</p>
          </div>
          <Toggle checked={includeContact} onChange={setIncludeContact} label="Include contact details" />
        </div>
        <div>
          <span className="field-label">File format</span>
          <Select defaultValue="utf8">
            <option value="utf8">CSV (UTF-8)</option>
          </Select>
          <p className="field-hint">Recommended for Excel, Google Sheets and most tools.</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
        <p className="text-xs text-ink-muted sm:mr-auto">
          {exportOrders.length} order(s) will be exported (based on current filters).
        </p>
        <Button onClick={handleDownload} disabled={exportOrders.length === 0}>
          <IconDownload width={18} height={18} /> Download CSV
        </Button>
      </div>
    </Card>
  );
}
