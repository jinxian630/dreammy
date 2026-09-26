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

export default function ServicesPage() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<Service[]>([]);
  const [total, setTotal] = useState(0);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, all] = await Promise.all([
      api.listServices({
        search,
        category: category as never,
        status: status as never,
        page,
        perPage: PER_PAGE,
      }),
      api.listServices({ perPage: 999 }),
    ]);
    setRows(list.data);
    setTotal(list.total);
    setAllServices(all.data);
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
    const orders = allServices.reduce((sum, s) => sum + s.ordersCount, 0);
    return { total: allServices.length, active, draft, orders };
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
    notify(nextStatus === 'active' ? 'Service published.' : 'Service unpublished.');
    load();
  }

  async function handleArchiveOne(service: Service) {
    setMenuFor(null);
    await api.archiveServices([service.id]);
    notify('Service archived.');
    load();
  }

  async function handleArchiveSelected() {
    setBusy(true);
    await api.archiveServices([...selected]);
    setBusy(false);
    setConfirmArchive(false);
    setSelected(new Set());
    notify(`${selected.size} service(s) archived.`);
    load();
  }

  return (
    <div onClick={() => setMenuFor(null)}>
      <PageHeader title="Services" subtitle="Manage Sky game services for your Dreammy store." />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard icon={IconBag} iconTone="blush" label="Total services" value={String(stats.total)} deltaPercent={33} deltaLabel="vs previous 30 days" />
        <StatCard icon={IconCart} iconTone="peach" label="Active services" value={String(stats.active)} deltaPercent={50} deltaLabel="vs previous 30 days" />
        <StatCard icon={IconFile} iconTone="lavender" label="Draft services" value={String(stats.draft)} deltaPercent={0} deltaLabel="vs previous 30 days" />
        <StatCard icon={IconChart} iconTone="blush" label="Total orders" value={String(stats.orders)} deltaPercent={18} deltaLabel="vs previous 30 days" />
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            leftIcon={<IconSearch width={18} height={18} />}
            placeholder="Search services (name, category…)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search services"
          />
        </div>
        <Select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className="sm:w-44">
          <option value="all">All categories</option>
          {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-36">
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </Select>
        <Link href="/admin/services/new">
          <Button className="w-full sm:w-auto">
            <IconPlus width={18} height={18} /> Add service
          </Button>
        </Link>
      </div>

      {/* Catalogue */}
      <Card className="mt-5">
        <CardHeader
          icon={<IconBag width={20} height={20} />}
          title="Service Catalogue"
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
              <IconTrash width={16} height={16} /> Archive selected
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
              title="No services found"
              description="Try adjusting your search or filters, or add a new service."
              action={
                <Link href="/admin/services/new">
                  <Button size="sm">
                    <IconPlus width={16} height={16} /> Add service
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
                        <input type="checkbox" aria-label="Select all" checked={allOnPageSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
                      </th>
                      <th className="pb-3 font-semibold">Service</th>
                      <th className="pb-3 font-semibold">Category</th>
                      <th className="pb-3 font-semibold">Price</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold">Updated</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
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
                          <Badge tone="blush">{SERVICE_CATEGORY_LABELS[s.category]}</Badge>
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
                          {SERVICE_CATEGORY_LABELS[s.category]}
                        </Badge>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-semibold text-ink">{formatMoney(s.priceMinor, s.currency, { decimals: false })}</span>
                          <span className="text-xs text-ink-muted">Updated {formatDate(s.updatedAt)}</span>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Link href={`/admin/services/${s.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" block>
                              <IconEdit width={15} height={15} /> Edit
                            </Button>
                          </Link>
                          <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(s)}>
                            {s.status === 'active' ? 'Unpublish' : 'Publish'}
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
        title="Archive services?"
        description={`This will archive ${selected.size} selected service(s) so they no longer appear in the store. You can restore them later. (Demo — mock data only.)`}
        confirmLabel="Archive"
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
  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label={`Actions for ${service.name}`}
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
            <IconEdit width={16} height={16} /> Edit
          </Link>
          <button role="menuitem" onClick={onPublishToggle} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-ink hover:bg-blush-soft">
            <IconChart width={16} height={16} /> {service.status === 'active' ? 'Unpublish' : 'Publish'}
          </button>
          <button role="menuitem" onClick={onArchive} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-danger hover:bg-danger-soft">
            <IconTrash width={16} height={16} /> Archive
          </button>
        </div>
      )}
    </div>
  );
}
