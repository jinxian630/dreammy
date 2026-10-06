'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { Service, ServiceStatus } from '@/types';
import { SERVICE_CATEGORY_LABELS } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { ServiceBadge } from '@/components/admin/StatusBadge';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { Pagination } from '@/components/admin/Pagination';
import { EmptyState, LoadingRows } from '@/components/admin/States';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';
import {
  IconBag,
  IconCart,
  IconFile,
  IconChart,
  IconSearch,
  IconPlus,
  IconMoreVertical,
  IconEdit,
  IconTrash,
} from '@/components/ui/icons';

const PER_PAGE = 10;
const MS_PER_DAY = 86_400_000;

/** Period-over-period % change, honest when the prior period is empty. */
function growthPercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default function ServicesPage() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [orderStats, setOrderStats] = useState<{ total: number; delta: number }>({ total: 0, delta: 0 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const now = Date.now();
    const from30 = new Date(now - 30 * MS_PER_DAY).toISOString();
    const from60 = new Date(now - 60 * MS_PER_DAY).toISOString();
    const [list, all, curOrders, prevOrders, totalOrders] = await Promise.all([
      api.listServices({
        search,
        category: category as never,
        status: status as never,
        page,
        perPage: PER_PAGE,
      }),
      api.listServices({ perPage: 999 }),
      // Real order counts: last 30 days vs the 30 days before, plus lifetime total.
      api.listOrders({ dateFrom: from30, perPage: 1 }),
      api.listOrders({ dateFrom: from60, dateTo: from30.slice(0, 10), perPage: 1 }),
      api.listOrders({ perPage: 1 }),
    ]);
    setRows(list.data);
    setTotal(list.total);
    setAllServices(all.data);
    setOrderStats({
      total: totalOrders.total,
      delta: growthPercent(curOrders.total, prevOrders.total),
    });
    setLoading(false);
  }, [search, category, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page when filters change.
  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  const stats = useMemo(() => {
    const active = allServices.filter((s) => s.status === 'active').length;
    const draft = allServices.filter((s) => s.status === 'draft').length;
    // Deltas = growth vs 30 days ago, computed from each service's createdAt.
    const cutoff = Date.now() - 30 * MS_PER_DAY;
    const existedBy30 = (s: Service) => new Date(s.createdAt).getTime() <= cutoff;
    const total30 = allServices.filter(existedBy30).length;
    const active30 = allServices.filter((s) => s.status === 'active' && existedBy30(s)).length;
    const draft30 = allServices.filter((s) => s.status === 'draft' && existedBy30(s)).length;
    return {
      total: allServices.length,
      active,
      draft,
      totalDelta: growthPercent(allServices.length, total30),
      activeDelta: growthPercent(active, active30),
      draftDelta: growthPercent(draft, draft30),
    };
  }, [allServices]);

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

  async function handleToggleStatus(service: Service) {
    setMenuFor(null);
    const nextStatus: ServiceStatus = service.status === 'active' ? 'draft' : 'active';
    await api.setServiceStatus(service.id, nextStatus);
    notify(nextStatus === 'active' ? t('sv.servicePublished') : t('sv.serviceUnpublished'));
    load();
  }

  async function handleArchiveOne(service: Service) {
    setMenuFor(null);
    await api.archiveServices([service.id]);
    notify(t('sv.serviceArchived'));
    load();
  }

  async function handleArchiveSelected() {
    setBusy(true);
    await api.archiveServices([...selected]);
    setBusy(false);
    setConfirmArchive(false);
    setSelected(new Set());
    notify(`${selected.size} ${t('sv.servicesArchivedSuffix')}`);
    load();
  }

  return (
    <div onClick={() => setMenuFor(null)}>
      <PageHeader title={t('sv.title')} subtitle={t('sv.subtitle')} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={IconBag} iconTone="blush" label={t('sv.totalServices')} value={String(stats.total)} deltaPercent={stats.totalDelta} deltaLabel={t('sv.vsPrev30')} />
        <StatCard icon={IconCart} iconTone="peach" label={t('sv.activeServices')} value={String(stats.active)} deltaPercent={stats.activeDelta} deltaLabel={t('sv.vsPrev30')} />
        <StatCard icon={IconFile} iconTone="lavender" label={t('sv.draftServices')} value={String(stats.draft)} deltaPercent={stats.draftDelta} deltaLabel={t('sv.vsPrev30')} />
        <StatCard icon={IconChart} iconTone="blush" label={t('sv.totalOrders')} value={String(orderStats.total)} deltaPercent={orderStats.delta} deltaLabel={t('sv.vsPrev30')} />
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            leftIcon={<IconSearch width={18} height={18} />}
            placeholder={t('sv.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('sv.search')}
          />
        </div>
        <Select aria-label={t('sv.category')} value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-44">
          <option value="all">{t('common.allCategories')}</option>
          {Object.keys(SERVICE_CATEGORY_LABELS).map((value) => (
            <option key={value} value={value}>
              {t(`category.${value}` as TKey)}
            </option>
          ))}
        </Select>
        <Select aria-label={t('sv.status')} value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-36">
          <option value="all">{t('common.allStatus')}</option>
          <option value="active">{t('serviceStatus.active')}</option>
          <option value="draft">{t('serviceStatus.draft')}</option>
        </Select>
        <Link href="/admin/services/new">
          <Button className="w-full sm:w-auto">
            <IconPlus width={18} height={18} /> {t('sv.addService')}
          </Button>
        </Link>
      </div>

      {/* Catalogue */}
      <Card className="mt-5">
        <CardHeader
          icon={<IconBag width={20} height={20} />}
          title={t('sv.catalogue')}
          action={
            <Button
              variant="outline"
              size="sm"
              disabled={selected.size === 0}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmArchive(true);
              }}
            >
              <IconTrash width={16} height={16} /> {t('sv.archiveSelected')}
              {selected.size > 0 && ` (${selected.size})`}
            </Button>
          }
        />

        <div className="mt-4">
          {loading ? (
            <LoadingRows />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={IconBag}
              title={t('sv.noServices')}
              description={t('sv.noServicesDesc')}
              action={
                <Link href="/admin/services/new">
                  <Button size="sm">
                    <IconPlus width={16} height={16} /> {t('sv.addService')}
                  </Button>
                </Link>
              }
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                      <th className="w-8 pb-3">
                        <input type="checkbox" aria-label={t('sv.selectAll')} checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
                      </th>
                      <th className="pb-3 font-semibold">{t('sv.thService')}</th>
                      <th className="pb-3 font-semibold">{t('sv.thCategory')}</th>
                      <th className="pb-3 font-semibold">{t('sv.thPrice')}</th>
                      <th className="pb-3 font-semibold">{t('sv.thStatus')}</th>
                      <th className="pb-3 font-semibold">{t('sv.thUpdated')}</th>
                      <th className="pb-3 font-semibold text-right">{t('sv.thActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blush-soft">
                    {rows.map((s) => (
                      <tr key={s.id}>
                        <td className="py-3">
                          <input type="checkbox" aria-label={`Select ${s.name}`} checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} className="h-4 w-4 accent-primary" />
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <ImageSlot imageKey={s.imageKey} ratio="1 / 1" rounded="rounded-xl" className="h-12 w-12 flex-shrink-0" alt={s.name} />
                            <div className="min-w-0">
                              <p className="font-semibold text-plum">{s.name}</p>
                              <p className="max-w-xs truncate text-xs text-ink-soft">{s.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge tone="blush">{t(`category.${s.category}` as TKey)}</Badge>
                        </td>
                        <td className="py-3 font-medium text-ink">{formatMoney(s.priceMinor, s.currency, { decimals: false })}</td>
                        <td className="py-3">
                          <ServiceBadge status={s.status} />
                        </td>
                        <td className="py-3 text-ink-soft">{formatDate(s.updatedAt)}</td>
                        <td className="py-3 text-right">
                          <RowMenu
                            open={menuFor === s.id}
                            onToggle={(e) => {
                              e.stopPropagation();
                              setMenuFor(menuFor === s.id ? null : s.id);
                            }}
                            service={s}
                            onPublishToggle={() => handleToggleStatus(s)}
                            onArchive={() => handleArchiveOne(s)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 lg:hidden">
                {rows.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                    <div className="flex items-start gap-3">
                      <input type="checkbox" aria-label={`Select ${s.name}`} checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} className="mt-1 h-4 w-4 accent-primary" />
                      <ImageSlot imageKey={s.imageKey} ratio="1 / 1" rounded="rounded-xl" className="h-16 w-16 flex-shrink-0" alt={s.name} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-plum">{s.name}</p>
                          <ServiceBadge status={s.status} />
                        </div>
                        <Badge tone="blush" className="mt-1">
                          {t(`category.${s.category}` as TKey)}
                        </Badge>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-ink">{formatMoney(s.priceMinor, s.currency, { decimals: false })}</span>
                          <span className="text-xs text-ink-muted">{t('sv.updatedPrefix')} {formatDate(s.updatedAt)}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Link href={`/admin/services/${s.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" block>
                              <IconEdit width={15} height={15} /> {t('common.edit')}
                            </Button>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(s)}>
                            {s.status === 'active' ? t('common.unpublish') : t('common.publish')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5">
                <Pagination page={page} perPage={PER_PAGE} total={total} onPageChange={setPage} />
              </div>
            </>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={confirmArchive}
        title={t('sv.confirmArchiveTitle')}
        description={`${t('sv.confirmArchivePrefix')} ${selected.size} ${t('sv.confirmArchiveSuffix')}`}
        confirmLabel={t('common.archive')}
        tone="danger"
        busy={busy}
        onConfirm={handleArchiveSelected}
        onCancel={() => setConfirmArchive(false)}
      />
    </div>
  );
}

function RowMenu({
  open,
  onToggle,
  service,
  onPublishToggle,
  onArchive,
}: {
  open: boolean;
  onToggle: (e: React.MouseEvent) => void;
  service: Service;
  onPublishToggle: () => void;
  onArchive: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={t('sv.thActions')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={onToggle}
        className="rounded-full p-2 text-ink-soft hover:bg-blush-soft hover:text-primary"
      >
        <IconMoreVertical width={18} height={18} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-2xl border border-blush-soft bg-white py-1 shadow-lift"
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/admin/services/${service.id}/edit`} role="menuitem" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink hover:bg-blush-soft">
            <IconEdit width={16} height={16} /> {t('common.edit')}
          </Link>
          <button role="menuitem" onClick={onPublishToggle} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-blush-soft">
            <IconChart width={16} height={16} /> {service.status === 'active' ? t('common.unpublish') : t('common.publish')}
          </button>
          <button role="menuitem" onClick={onArchive} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-soft">
            <IconTrash width={16} height={16} /> {t('common.archive')}
          </button>
        </div>
      )}
    </div>
  );
}
