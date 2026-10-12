'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconRefresh,
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
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Service | null>(null);
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
    setActionsFor(null);
    const nextStatus: ServiceStatus = service.status === 'active' ? 'draft' : 'active';
    await api.setServiceStatus(service.id, nextStatus);
    notify(nextStatus === 'active' ? t('sv.servicePublished') : t('sv.serviceUnpublished'));
    load();
  }

  function handleArchiveOne(service: Service) {
    setActionsFor(null);
    setArchiveTarget(service);
  }

  // Un-archive: bring the service back into the catalogue as a draft so the
  // owner can review it before publishing again.
  async function handleRestore(service: Service) {
    setActionsFor(null);
    await api.setServiceStatus(service.id, 'draft');
    notify(t('sv.serviceRestored'));
    load();
  }

  async function confirmArchiveOne() {
    if (!archiveTarget) return;
    setBusy(true);
    await api.archiveServices([archiveTarget.id]);
    setBusy(false);
    setArchiveTarget(null);
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
    <div onClick={() => setActionsFor(null)}>
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
          <option value="archived">{t('serviceStatus.archived')}</option>
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
                      <SwipeRow key={s.id} onOpenChange={(v) => setActionsFor(v ? s.id : null)}>
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
                        <td className="py-3 font-medium text-ink">
                          <div>{formatMoney(s.priceMinor, 'MYR')}</div>
                          {s.priceCnyMinor != null && (
                            <div className="text-xs text-ink-muted">{formatMoney(s.priceCnyMinor, 'CNY')}</div>
                          )}
                        </td>
                        <td className="py-3">
                          <ServiceBadge status={s.status} />
                        </td>
                        <td className="py-3 text-ink-soft">{formatDate(s.updatedAt)}</td>
                        <td className="py-3">
                          <div className="relative ml-auto flex h-9 items-center justify-end overflow-hidden">
                            {/* Actions (in flow → define the column width); slide in when revealed */}
                            <div
                              className={`flex items-center gap-1 whitespace-nowrap transition-all duration-200 ease-out ${
                                actionsFor === s.id ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-6 opacity-0'
                              }`}
                            >
                              <Link href={`/admin/services/${s.id}/edit`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-blush-soft hover:text-primary">
                                <IconEdit width={15} height={15} /> {t('common.edit')}
                              </Link>
                              {s.status === 'archived' ? (
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRestore(s); }} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-blush-soft hover:text-primary">
                                  <IconRefresh width={15} height={15} /> {t('common.restore')}
                                </button>
                              ) : (
                                <>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleStatus(s); }} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-blush-soft hover:text-primary">
                                    <IconChart width={15} height={15} /> {s.status === 'active' ? t('common.unpublish') : t('common.publish')}
                                  </button>
                                  <button type="button" onClick={(e) => { e.stopPropagation(); handleArchiveOne(s); }} className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger-soft">
                                    <IconTrash width={15} height={15} /> {t('common.archive')}
                                  </button>
                                </>
                              )}
                            </div>
                            {/* Hint overlay (shown when closed; never intercepts clicks) */}
                            <span
                              className={`pointer-events-none absolute inset-y-0 right-0 flex select-none items-center gap-1 whitespace-nowrap text-xs text-ink-muted transition-opacity duration-200 ${
                                actionsFor === s.id ? 'opacity-0' : 'opacity-100'
                              }`}
                            >
                              <IconChevronLeft width={14} height={14} /> {t('sv.swipeActions')}
                            </span>
                          </div>
                        </td>
                      </SwipeRow>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="space-y-3 lg:hidden">
                {rows.map((s) => (
                  <SwipeCard key={s.id} onOpenChange={(v) => setActionsFor(v ? s.id : null)}>
                    <div className="flex items-start gap-3 rounded-2xl border border-blush-soft bg-surface-soft p-3">
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
                          <span className="font-semibold text-ink">
                            {formatMoney(s.priceMinor, 'MYR')}
                            {s.priceCnyMinor != null && (
                              <span className="ml-2 text-xs font-normal text-ink-muted">{formatMoney(s.priceCnyMinor, 'CNY')}</span>
                            )}
                          </span>
                          <span className="text-xs text-ink-muted">{t('sv.updatedPrefix')} {formatDate(s.updatedAt)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {actionsFor === s.id ? (
                            <>
                              <Link href={`/admin/services/${s.id}/edit`} onClick={(e) => e.stopPropagation()}>
                                <Button variant="outline" size="sm"><IconEdit width={15} height={15} /> {t('common.edit')}</Button>
                              </Link>
                              {s.status === 'archived' ? (
                                <Button variant="secondary" size="sm" onClick={() => handleRestore(s)}>
                                  <IconRefresh width={15} height={15} /> {t('common.restore')}
                                </Button>
                              ) : (
                                <>
                                  <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(s)}>
                                    {s.status === 'active' ? t('common.unpublish') : t('common.publish')}
                                  </Button>
                                  <Button variant="danger" size="sm" onClick={() => handleArchiveOne(s)}>
                                    <IconTrash width={15} height={15} /> {t('common.archive')}
                                  </Button>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="inline-flex select-none items-center gap-1 text-xs text-ink-muted">
                              <IconChevronLeft width={14} height={14} /> {t('sv.swipeActions')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </SwipeCard>
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

      <ConfirmDialog
        open={archiveTarget !== null}
        title={t('sv.confirmArchiveTitle')}
        description={`“${archiveTarget?.name ?? ''}” ${t('sv.confirmArchiveOneSuffix')}`}
        confirmLabel={t('common.archive')}
        tone="danger"
        busy={busy}
        onConfirm={confirmArchiveOne}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}

/**
 * Swipe/drag a row or card to the left to reveal its actions (Edit / Publish /
 * Archive). Built on Pointer Events so it works with touch, pen and mouse;
 * vertical gestures still scroll the page. `onOpenChange(true)` fires once the
 * horizontal travel passes the trigger; swiping back closes it. A plain tap on
 * an inner control is never treated as a swipe.
 */
function useSwipeToggle(onOpenChange: (open: boolean) => void) {
  const TRIGGER = 40; // px of horizontal travel to reveal / hide
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<'none' | 'h' | 'v'>('none');
  const swiped = useRef(false);

  return {
    onPointerDown(e: React.PointerEvent) {
      start.current = { x: e.clientX, y: e.clientY };
      axis.current = 'none';
      swiped.current = false;
    },
    onPointerMove(e: React.PointerEvent) {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (axis.current === 'none') {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      }
      if (axis.current === 'h') {
        swiped.current = true;
        if (dx <= -TRIGGER) onOpenChange(true);
        else if (dx >= TRIGGER) onOpenChange(false);
      }
    },
    onPointerUp() {
      start.current = null;
      axis.current = 'none';
    },
    // A swipe can emit a trailing click — swallow it so the page's outside-click
    // handler doesn't immediately close the actions we just revealed.
    onClick(e: React.MouseEvent) {
      if (swiped.current) {
        e.stopPropagation();
        swiped.current = false;
      }
    },
    style: { touchAction: 'pan-y' as const },
  };
}

function SwipeRow({ onOpenChange, children }: { onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  const swipe = useSwipeToggle(onOpenChange);
  return (
    <tr {...swipe} style={{ ...swipe.style, cursor: 'grab' }}>
      {children}
    </tr>
  );
}

function SwipeCard({ onOpenChange, children }: { onOpenChange: (open: boolean) => void; children: React.ReactNode }) {
  const swipe = useSwipeToggle(onOpenChange);
  return <li {...swipe}>{children}</li>;
}
