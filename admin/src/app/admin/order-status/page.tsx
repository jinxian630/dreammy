'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { FulfillmentStatus, Order, StaffOption } from '@/types';
import { FULFILLMENT_STATUS_LABELS } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { PaymentBadge } from '@/components/admin/StatusBadge';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { LoadingRows } from '@/components/admin/States';
import { useToast } from '@/components/ui/Toast';
import { IconSearch, IconUser } from '@/components/ui/icons';
import { useCurrentMember } from '@/lib/auth/useCurrentMember';
import { canMutate } from '@/lib/auth/roles';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';

/** Board columns, left-to-right, keyed by fulfillment status. */
const COLUMNS: FulfillmentStatus[] = [
  'pending',
  'awaiting_guardian',
  'in_progress',
  'completed',
  'cancelled',
];

const POLL_MS = 15000;

export default function OrderStatusPage() {
  const { notify } = useToast();
  const { member } = useCurrentMember();
  const { t } = useI18n();
  // While the role is still loading we optimistically show the full controls;
  // the server is the real boundary (assignStaff / updateFulfillment gating).
  const canEdit = !member || canMutate(member.role);
  // Guardians are confined to this board and cannot open order detail pages.
  const canOpenDetail = !member || member.role !== 'guardian';

  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [myOnly, setMyOnly] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const [list, s] = await Promise.all([api.listOrders({ perPage: 999 }), api.listStaff()]);
    setOrders(list.data);
    setStaff(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Near real-time: silently refresh the board so new assignments and status
  // changes surface without a manual reload.
  useEffect(() => {
    const timer = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (myOnly && o.assignment?.staffId !== member?.userId) return false;
      if (!term) return true;
      return (
        o.code.toLowerCase().includes(term) ||
        o.traveler.name.toLowerCase().includes(term) ||
        o.serviceName.toLowerCase().includes(term)
      );
    });
  }, [orders, search, myOnly, member]);

  const columns = useMemo(() => {
    const byStatus = new Map<FulfillmentStatus, Order[]>();
    for (const status of COLUMNS) byStatus.set(status, []);
    for (const o of filtered) byStatus.get(o.fulfillmentStatus)?.push(o);
    for (const list of byStatus.values()) list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return byStatus;
  }, [filtered]);

  async function assign(orderId: string, staffId: string | null) {
    const updated = await api.assignStaff(orderId, staffId);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    notify(staffId ? 'Task assigned.' : 'Assignment cleared.');
  }

  async function changeStatus(orderId: string, status: FulfillmentStatus) {
    const updated = await api.updateFulfillment(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    notify('Order status updated.');
  }

  return (
    <div>
      <PageHeader title={t('orderStatus.title')} subtitle={t('orderStatus.subtitle')} />

      {/* Controls */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-3">
            <Input
              leftIcon={<IconSearch width={18} height={18} />}
              placeholder={t('orderStatus.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label={t('orderStatus.search')}
              className="max-w-sm"
            />
            <Toggle checked={myOnly} onChange={setMyOnly} label={t('orderStatus.myTasksOnly')} />
            <span className="text-sm text-ink-soft">{t('orderStatus.myTasksOnly')}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            {t('orderStatus.live')}
          </span>
        </div>
      </Card>

      {/* Board */}
      <div className="mt-5">
        {loading ? (
          <Card>
            <LoadingRows rows={6} />
          </Card>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {COLUMNS.map((status) => {
              const list = columns.get(status) ?? [];
              return (
                <section key={status} className="w-72 flex-shrink-0">
                  <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="font-display text-sm text-plum">
                      {t(`fulfillment.${status}` as TKey)}
                    </h2>
                    <span className="rounded-full bg-blush-soft px-2 py-0.5 text-xs font-semibold text-ink-soft">
                      {list.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {list.length === 0 ? (
                      <p className="rounded-2xl border border-dashed border-blush-deep/40 p-4 text-center text-xs text-ink-muted">
                        {t('orderStatus.noOrders')}
                      </p>
                    ) : (
                      list.map((o) => (
                        <OrderCard
                          key={o.id}
                          order={o}
                          staff={staff}
                          canEdit={canEdit}
                          canOpenDetail={canOpenDetail}
                          memberUserId={member?.userId ?? null}
                          onAssign={assign}
                          onChangeStatus={changeStatus}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  staff,
  canEdit,
  canOpenDetail,
  memberUserId,
  onAssign,
  onChangeStatus,
}: {
  order: Order;
  staff: StaffOption[];
  canEdit: boolean;
  canOpenDetail: boolean;
  memberUserId: string | null;
  onAssign: (orderId: string, staffId: string | null) => void;
  onChangeStatus: (orderId: string, status: FulfillmentStatus) => void;
}) {
  const { t } = useI18n();
  const assignedToMe = order.assignment?.staffId === memberUserId;

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        {canOpenDetail ? (
          <Link href={`/admin/orders/${order.id}`} className="font-semibold text-plum hover:underline">
            {order.code}
          </Link>
        ) : (
          <span className="font-semibold text-plum">{order.code}</span>
        )}
        <PaymentBadge status={order.paymentStatus} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <ImageSlot
          imageKey={order.serviceImageKey}
          ratio="1 / 1"
          rounded="rounded-lg"
          className="h-9 w-9 flex-shrink-0"
          alt={order.serviceName}
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{order.serviceName}</p>
          <p className="truncate text-xs text-ink-muted">{order.traveler.name}</p>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium text-ink">
        {formatMoney(order.amountMinor, order.currency)}
      </p>

      {/* Assignee */}
      <div className="mt-2 rounded-xl bg-blush-soft/50 p-2 text-xs">
        <p className="flex items-center gap-1 font-semibold text-plum">
          <IconUser width={14} height={14} />
          {order.assignment?.staffEmail ?? t('orderStatus.unassigned')}
        </p>
        {order.assignment?.assignedByEmail && (
          <p className="mt-0.5 text-ink-muted">
            {t('orderStatus.by')} {order.assignment.assignedByEmail}
            {order.assignment.assignedAt ? ` · ${formatDateTime(order.assignment.assignedAt)}` : ''}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 space-y-2">
        {canEdit ? (
          <Select
            aria-label={t('orderStatus.assigneeAria')}
            value={order.assignment?.staffId ?? ''}
            onChange={(e) => onAssign(order.id, e.target.value || null)}
          >
            <option value="">{t('orderStatus.unassigned')}</option>
            {staff.map((s) => (
              <option key={s.userId} value={s.userId}>
                {s.email}
              </option>
            ))}
          </Select>
        ) : assignedToMe ? (
          <Button variant="outline" size="sm" block onClick={() => onAssign(order.id, null)}>
            {t('orderStatus.release')}
          </Button>
        ) : (
          <Button size="sm" block onClick={() => onAssign(order.id, memberUserId)} disabled={!memberUserId}>
            <IconUser width={14} height={14} /> {t('orderStatus.assignToMe')}
          </Button>
        )}

        {canEdit && (
          <Select
            aria-label={t('orderStatus.statusAria')}
            value={order.fulfillmentStatus}
            onChange={(e) => onChangeStatus(order.id, e.target.value as FulfillmentStatus)}
          >
            {Object.keys(FULFILLMENT_STATUS_LABELS).map((value) => (
              <option key={value} value={value}>
                {t(`fulfillment.${value}` as TKey)}
              </option>
            ))}
          </Select>
        )}
      </div>
    </Card>
  );
}
