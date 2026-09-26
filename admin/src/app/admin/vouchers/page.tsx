'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { VoucherWithStatus } from '@/lib/api';
import type { Service, VoucherInput } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { VoucherBadge } from '@/components/admin/StatusBadge';
import { EmptyState, LoadingRows } from '@/components/admin/States';
import { VoucherForm } from './VoucherForm';
import { useToast } from '@/components/ui/Toast';
import { IconSearch, IconTicket, IconEdit } from '@/components/ui/icons';

type StatusTab = 'all' | 'active' | 'scheduled' | 'expired';

export default function VouchersPage() {
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');
  const [vouchers, setVouchers] = useState<VoucherWithStatus[]>([]);
  const [allVouchers, setAllVouchers] = useState<VoucherWithStatus[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VoucherWithStatus | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [list, all, svc] = await Promise.all([
      api.listVouchers({ search, status: tab }),
      api.listVouchers({}),
      api.listServices({ perPage: 999 }),
    ]);
    setVouchers(list);
    setAllVouchers(all);
    setServices(svc.data);
    setLoading(false);
  }, [search, tab]);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    return {
      all: allVouchers.length,
      active: allVouchers.filter((v) => v.status === 'active').length,
      scheduled: allVouchers.filter((v) => v.status === 'scheduled').length,
      expired: allVouchers.filter((v) => v.status === 'expired').length,
    };
  }, [allVouchers]);

  async function handleSubmit(input: VoucherInput) {
    if (editing) {
      await api.updateVoucher(editing.id, input);
      notify('Voucher updated.');
      setEditing(null);
    } else {
      await api.createVoucher(input);
      notify('Voucher saved.');
    }
    load();
  }

  function serviceValueLabel(v: VoucherWithStatus): string {
    if (v.discountType === 'fixed') return formatMoney(v.valueMinor ?? 0, v.currency);
    return `${v.percent}% off`;
  }

  return (
    <div>
      <PageHeader title="Vouchers" subtitle="Create and manage voucher codes for your Dreammy store." />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Voucher list */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <IconTicket width={18} height={18} />
              </span>
              <div>
                <h2 className="font-display text-lg text-plum">Voucher list</h2>
                <p className="text-sm text-ink-soft">View and manage all voucher codes.</p>
              </div>
            </div>

            <div className="mt-4">
              <Input
                leftIcon={<IconSearch width={18} height={18} />}
                placeholder="Search by code or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search vouchers"
              />
            </div>

            <div className="mt-3">
              <Tabs<StatusTab>
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'all', label: 'All', count: counts.all },
                  { value: 'active', label: 'Active', count: counts.active },
                  { value: 'scheduled', label: 'Scheduled', count: counts.scheduled },
                  { value: 'expired', label: 'Expired', count: counts.expired },
                ]}
              />
            </div>

            <div className="mt-4">
              {loading ? (
                <LoadingRows />
              ) : vouchers.length === 0 ? (
                <EmptyState icon={IconTicket} title="No vouchers found" description="Try a different search or create a new voucher." />
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                          <th className="pb-3 font-semibold">Voucher code</th>
                          <th className="pb-3 font-semibold">Type &amp; value</th>
                          <th className="pb-3 font-semibold">Validity (MYT)</th>
                          <th className="pb-3 font-semibold">Usage</th>
                          <th className="pb-3 font-semibold">Status</th>
                          <th className="pb-3 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blush-soft">
                        {vouchers.map((v) => (
                          <tr key={v.id}>
                            <td className="py-3">
                              <p className="font-semibold text-plum">{v.code}</p>
                              <p className="text-xs text-ink-soft">{v.internalName}</p>
                            </td>
                            <td className="py-3">
                              <p className="font-medium text-ink">{serviceValueLabel(v)}</p>
                              <p className="text-xs text-ink-soft">Min spend {formatMoney(v.minSpendMinor, v.currency)}</p>
                            </td>
                            <td className="py-3 text-xs text-ink-soft">
                              {formatDateTime(v.startAt)}
                              <br />– {formatDateTime(v.endAt)}
                            </td>
                            <td className="py-3 text-ink">
                              {v.usedCount} / {v.totalLimit}
                            </td>
                            <td className="py-3">
                              <VoucherBadge status={v.status} />
                            </td>
                            <td className="py-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setEditing(v)}>
                                <IconEdit width={15} height={15} /> Edit
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <ul className="space-y-3 lg:hidden">
                    {vouchers.map((v) => (
                      <li key={v.id} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-plum">{v.code}</p>
                            <p className="text-xs text-ink-soft">{v.internalName}</p>
                          </div>
                          <VoucherBadge status={v.status} />
                        </div>
                        <div className="mt-2 text-sm text-ink">
                          <p className="font-medium">
                            {serviceValueLabel(v)} · <span className="text-ink-soft">Min spend {formatMoney(v.minSpendMinor, v.currency)}</span>
                          </p>
                          <p className="mt-1 text-xs text-ink-soft">
                            {formatDateTime(v.startAt)} – {formatDateTime(v.endAt)}
                          </p>
                          <p className="mt-1 text-xs text-ink-soft">
                            {v.usedCount} / {v.totalLimit} used
                          </p>
                        </div>
                        <Button variant="outline" size="sm" block className="mt-2" onClick={() => setEditing(v)}>
                          <IconEdit width={15} height={15} /> Edit
                        </Button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Create / edit form */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <VoucherForm editing={editing} services={services} onSubmit={handleSubmit} onCancelEdit={() => setEditing(null)} />
          </Card>
        </div>
      </div>
    </div>
  );
}
