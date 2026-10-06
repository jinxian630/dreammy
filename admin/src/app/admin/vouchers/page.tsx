'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { VoucherWithStatus } from '@/lib/api';
import type { Service, VoucherInput } from '@/types';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { VoucherBadge } from '@/components/admin/StatusBadge';
import { EmptyState, LoadingRows } from '@/components/admin/States';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { VoucherForm } from './VoucherForm';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { IconSearch, IconTicket, IconEdit, IconTrash } from '@/components/ui/icons';

type StatusTab = 'all' | 'available' | 'unavailable';

export default function VouchersPage() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<StatusTab>('all');
  const [vouchers, setVouchers] = useState<VoucherWithStatus[]>([]);
  const [allVouchers, setAllVouchers] = useState<VoucherWithStatus[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<VoucherWithStatus | null>(null);
  const [deleting, setDeleting] = useState<VoucherWithStatus | null>(null);
  const [busy, setBusy] = useState(false);

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
      available: allVouchers.filter((v) => v.status === 'available').length,
      unavailable: allVouchers.filter((v) => v.status === 'unavailable').length,
    };
  }, [allVouchers]);

  async function handleSubmit(input: VoucherInput) {
    if (editing) {
      await api.updateVoucher(editing.id, input);
      notify(t('vc.voucherUpdated'));
      setEditing(null);
    } else {
      await api.createVoucher(input);
      notify(t('vc.voucherSaved'));
    }
    load();
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.deleteVoucher(deleting.id);
      notify(t('vc.voucherDeleted'));
      if (editing?.id === deleting.id) setEditing(null);
      setDeleting(null);
      load();
    } catch {
      notify(t('vc.deleteFailed'), 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title={t('vc.title')} subtitle={t('vc.subtitle')} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Voucher list */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                <IconTicket width={18} height={18} />
              </span>
              <div>
                <h2 className="font-display text-lg text-plum">{t('vc.voucherList')}</h2>
                <p className="text-sm text-ink-soft">{t('vc.voucherListSub')}</p>
              </div>
            </div>

            <div className="mt-4">
              <Input
                leftIcon={<IconSearch width={18} height={18} />}
                placeholder={t('vc.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={t('vc.search')}
              />
            </div>

            <div className="mt-3">
              <Tabs<StatusTab>
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'all', label: t('vc.tabAll'), count: counts.all },
                  { value: 'available', label: t('vc.tabAvailable'), count: counts.available },
                  { value: 'unavailable', label: t('vc.tabUnavailable'), count: counts.unavailable },
                ]}
              />
            </div>

            <div className="mt-4">
              {loading ? (
                <LoadingRows />
              ) : vouchers.length === 0 ? (
                <EmptyState icon={IconTicket} title={t('vc.noVouchers')} description={t('vc.noVouchersDesc')} />
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                          <th className="pb-3 font-semibold">{t('vc.thReward')}</th>
                          <th className="pb-3 font-semibold">{t('vc.thFreeService')}</th>
                          <th className="pb-3 font-semibold">{t('vc.thPoints')}</th>
                          <th className="pb-3 font-semibold">{t('vc.thStatus')}</th>
                          <th className="pb-3 font-semibold text-right">{t('vc.thActions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blush-soft">
                        {vouchers.map((v) => (
                          <tr key={v.id}>
                            <td className="py-3">
                              <p className="font-semibold text-plum">{v.name}</p>
                              {v.description && <p className="line-clamp-1 text-xs text-ink-soft">{v.description}</p>}
                            </td>
                            <td className="py-3 text-ink">{v.serviceName ?? '—'}</td>
                            <td className="py-3 font-medium text-plum">{v.pointsCost.toLocaleString()} {t('vc.pts')}</td>
                            <td className="py-3">
                              <VoucherBadge status={v.status} />
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setEditing(v)}>
                                  <IconEdit width={15} height={15} /> {t('common.edit')}
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setDeleting(v)} aria-label={t('common.delete')} className="text-danger">
                                  <IconTrash width={15} height={15} /> {t('common.delete')}
                                </Button>
                              </div>
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
                            <p className="font-semibold text-plum">{v.name}</p>
                            {v.description && <p className="line-clamp-1 text-xs text-ink-soft">{v.description}</p>}
                          </div>
                          <VoucherBadge status={v.status} />
                        </div>
                        <div className="mt-2 text-sm text-ink">
                          <p className="font-medium text-plum">{v.pointsCost.toLocaleString()} {t('vc.pts')}</p>
                          <p className="mt-1 text-xs text-ink-soft">{t('vc.freeServicePrefix')}: {v.serviceName ?? '—'}</p>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button variant="outline" size="sm" block onClick={() => setEditing(v)}>
                            <IconEdit width={15} height={15} /> {t('common.edit')}
                          </Button>
                          <Button variant="outline" size="sm" block onClick={() => setDeleting(v)} className="text-danger">
                            <IconTrash width={15} height={15} /> {t('common.delete')}
                          </Button>
                        </div>
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

      <ConfirmDialog
        open={deleting !== null}
        title={t('vc.confirmDeleteTitle')}
        description={`"${deleting?.name ?? ''}" ${t('vc.confirmDeleteSuffix')}`}
        confirmLabel={t('vc.confirmDeleteBtn')}
        tone="danger"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
