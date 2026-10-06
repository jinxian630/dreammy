'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { CurrencyCode, Guardian, Order, Service, StaffOption } from '@/types';
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
import { useI18n } from '@/lib/i18n/I18nProvider';
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
  assignedStaffId: string;
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
  assignedStaffId: 'all',
  currency: 'all',
};

export default function OrdersPage() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [allFiltered, setAllFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [services, setServices] = useState<Service[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);

  useEffect(() => {
    api.listServices({ perPage: 999 }).then((r) => setServices(r.data));
    api.listGuardians().then(setGuardians);
    api.listStaff().then(setStaff);
  }, []);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      const query = {
        search: filters.search,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        paymentStatus: filters.paymentStatus as never,
        fulfillmentStatus: filters.fulfillmentStatus as never,
        serviceId: filters.serviceId,
        guardianId: filters.guardianId,
        assignedStaffId: filters.assignedStaffId,
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
    },
    [filters, page],
  );

  useEffect(() => {
    load();
  }, [load]);

  // Near real-time: silently re-fetch the current view so new assignments and
  // status changes surface without a manual reload.
  useEffect(() => {
    const timer = setInterval(() => load(true), 20000);
    return () => clearInterval(timer);
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
      <PageHeader title={t('orders.title')} subtitle={t('orders.subtitle')} />

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            leftIcon={<IconSearch width={18} height={18} />}
            placeholder={t('orders.searchPlaceholder')}
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            aria-label={t('orders.search')}
          />
          <div className="flex items-center gap-2">
            <Input type="date" value={filters.dateFrom} onChange={(e) => setFilter('dateFrom', e.target.value)} aria-label={t('orders.dateFrom')} leftIcon={<IconCalendar width={18} height={18} />} />
            <span className="text-ink-muted">–</span>
            <Input type="date" value={filters.dateTo} onChange={(e) => setFilter('dateTo', e.target.value)} aria-label={t('orders.dateTo')} />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="field-label">{t('orders.paymentStatus')}</span>
            <Select value={filters.paymentStatus} onChange={(e) => setFilter('paymentStatus', e.target.value)}>
              <option value="all">{t('common.all')}</option>
              <option value="paid">{t('payment.paid')}</option>
              <option value="pending">{t('payment.pending')}</option>
              <option value="refunded">{t('payment.refunded')}</option>
            </Select>
          </label>
          <label className="block">
            <span className="field-label">{t('orders.fulfillmentStatus')}</span>
            <Select value={filters.fulfillmentStatus} onChange={(e) => setFilter('fulfillmentStatus', e.target.value)}>
              <option value="all">{t('common.all')}</option>
              <option value="pending">{t('fulfillment.pending')}</option>
              <option value="awaiting_guardian">{t('fulfillment.awaiting_guardian')}</option>
              <option value="in_progress">{t('fulfillment.in_progress')}</option>
              <option value="completed">{t('fulfillment.completed')}</option>
              <option value="cancelled">{t('fulfillment.cancelled')}</option>
            </Select>
          </label>
          <label className="block">
            <span className="field-label">{t('orders.service')}</span>
            <Select value={filters.serviceId} onChange={(e) => setFilter('serviceId', e.target.value)}>
              <option value="all">{t('common.allServices')}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">{t('orders.guardian')}</span>
            <Select value={filters.guardianId} onChange={(e) => setFilter('guardianId', e.target.value)}>
              <option value="all">{t('orders.allGuardians')}</option>
              {guardians.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">{t('orders.assignedTo')}</span>
            <Select value={filters.assignedStaffId} onChange={(e) => setFilter('assignedStaffId', e.target.value)}>
              <option value="all">{t('orders.allStaff')}</option>
              <option value="unassigned">{t('orders.unassigned')}</option>
              {staff.map((s) => (
                <option key={s.userId} value={s.userId}>
                  {s.email}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="field-label">{t('orders.currency')}</span>
            <Select value={filters.currency} onChange={(e) => setFilter('currency', e.target.value)}>
              <option value="all">{t('common.all')}</option>
              <option value="MYR">MYR (RM)</option>
              <option value="CNY">CNY (¥)</option>
            </Select>
          </label>
          <div className="flex items-end gap-2">
            <Button variant="outline" block onClick={() => setFilters(DEFAULT_FILTERS)}>
              {t('orders.resetFilters')}
            </Button>
            <Button block onClick={() => load()}>
              <IconSearch width={18} height={18} /> {t('orders.searchBtn')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Order list */}
      <Card className="mt-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg text-plum">{t('orders.orderList')} ({total})</h2>
        </div>

        <div className="mt-4">
          {loading ? (
            <LoadingRows />
          ) : rows.length === 0 ? (
            <EmptyState icon={IconClipboard} title={t('orders.noMatch')} description={t('orders.noMatchDesc')} action={<Button size="sm" variant="outline" onClick={() => setFilters(DEFAULT_FILTERS)}>{t('orders.resetFilters')}</Button>} />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                      <th className="w-8 pb-3">
                        <input type="checkbox" aria-label={t('orders.selectAll')} checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
                      </th>
                      <th className="pb-3 font-semibold">{t('orders.thOrderId')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thTraveler')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thService')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thGuardian')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thAssignedTo')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thTotal')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thPayment')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thFulfillment')}</th>
                      <th className="pb-3 font-semibold">{t('orders.thCreated')}</th>
                      <th className="pb-3 font-semibold text-right">{t('orders.thView')}</th>
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
                        <td className="py-3 text-ink-soft">{o.assignment?.staffEmail ?? t('orders.unassigned')}</td>
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
                        <p className="mt-1 text-xs text-ink-soft">{t('orders.guardian')}: {o.guardianName ?? '—'}</p>
                        <p className="text-xs text-ink-soft">{t('orders.assignedTo')}: {o.assignment?.staffEmail ?? t('orders.unassigned')}</p>
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
        onDownloaded={(n) => notify(`${t('orders.exportedPrefix')} ${n} ${t('orders.exportedSuffix')}`)}
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
  const { t } = useI18n();
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
          <h2 className="font-display text-lg text-plum">{t('orders.exportTitle')}</h2>
          <p className="text-sm text-ink-soft">
            {t('orders.exportIntro')}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl bg-info-soft p-3 text-sm text-info">
        <IconInfo width={18} height={18} className="mt-0.5 flex-shrink-0" />
        <p>
          {t('orders.exportFollowsPrefix')} {filtered.length} {t('orders.exportFollowsSuffix')} <strong>{t('orders.demoData')}</strong> {t('orders.notReal')}
        </p>
      </div>

      {/* Scope */}
      <div className="mt-4">
        <span className="field-label">{t('orders.exportScope')}</span>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${scope === 'all' ? 'border-primary bg-primary-soft/50' : 'border-blush-deep/40'}`}>
            <input type="radio" name="scope" checked={scope === 'all'} onChange={() => setScope('all')} className="mt-1 h-4 w-4 accent-primary" />
            <span>
              <span className="block text-sm font-semibold text-plum">{t('orders.allFiltered')} ({filtered.length})</span>
              <span className="block text-xs text-ink-soft">{t('orders.allFilteredDesc')}</span>
            </span>
          </label>
          <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 ${scope === 'selected' ? 'border-primary bg-primary-soft/50' : 'border-blush-deep/40'}`}>
            <input type="radio" name="scope" checked={scope === 'selected'} onChange={() => setScope('selected')} className="mt-1 h-4 w-4 accent-primary" />
            <span>
              <span className="block text-sm font-semibold text-plum">{t('orders.selectedOrders')} ({selectedIds.size})</span>
              <span className="block text-xs text-ink-soft">{t('orders.selectedOrdersDesc')}</span>
            </span>
          </label>
        </div>
      </div>

      {/* Date range display */}
      <div className="mt-4">
        <span className="field-label">{t('orders.dateRangeFilters')}</span>
        <div className="rounded-2xl border border-blush-soft bg-cream-deep/40 px-3.5 py-3 text-sm text-ink-soft">
          {dateFrom} – {dateTo}
          <span className="ml-2 text-xs text-ink-muted">{t('orders.dateRangeNote')}</span>
        </div>
      </div>

      {/* Column picker */}
      <div className="mt-4">
        <span className="field-label">{t('orders.selectColumns')}</span>
        <p className="field-hint mb-2">{t('orders.selectColumnsDesc')}</p>
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
            <p className="text-sm font-semibold text-plum">{t('orders.includeContact')}</p>
            <p className="text-xs text-ink-soft">{t('orders.includeContactDesc')}</p>
          </div>
          <Toggle checked={includeContact} onChange={setIncludeContact} label={t('orders.includeContactLabel')} />
        </div>
        <div>
          <span className="field-label">{t('orders.fileFormat')}</span>
          <Select defaultValue="utf8">
            <option value="utf8">CSV (UTF-8)</option>
          </Select>
          <p className="field-hint">{t('orders.fileFormatDesc')}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center gap-2 sm:flex-row sm:justify-end">
        <p className="text-xs text-ink-muted sm:mr-auto">
          {exportOrders.length} {t('orders.willExport')}
        </p>
        <Button onClick={handleDownload} disabled={exportOrders.length === 0}>
          <IconDownload width={18} height={18} /> {t('orders.downloadCsv')}
        </Button>
      </div>
    </Card>
  );
}
