'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { FulfillmentStatus, Guardian, Order } from '@/types';
import { FULFILLMENT_STATUS_LABELS } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDateTime } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { PaymentBadge, FulfillmentBadge } from '@/components/admin/StatusBadge';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Timeline } from '@/components/admin/Timeline';
import { ProgressBar } from '@/components/admin/ProgressBar';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { LoadingRows, EmptyState } from '@/components/admin/States';
import { useToast } from '@/components/ui/Toast';
import {
  IconArrowLeft,
  IconUser,
  IconGlobe,
  IconCoins,
  IconClipboard,
  IconRefresh,
  IconPhoto,
  IconFile,
  IconLightning,
  IconCheckCircle,
  IconX,
  IconInfo,
  IconSave,
  IconClock,
} from '@/components/ui/icons';

type ActionKind = 'complete' | 'cancel' | 'refund' | null;

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { notify } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardianId, setGuardianId] = useState<string>('');
  const [statusValue, setStatusValue] = useState<FulfillmentStatus>('pending');
  const [note, setNote] = useState('');
  const [action, setAction] = useState<ActionKind>(null);
  const [busy, setBusy] = useState(false);

  const hydrate = useCallback((o: Order) => {
    setOrder(o);
    setGuardianId(o.guardianId ?? '');
    setStatusValue(o.fulfillmentStatus);
    setNote(o.internalNotes);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getOrder(id), api.listGuardians()]).then(([o, g]) => {
      if (!active) return;
      if (o) hydrate(o);
      setGuardians(g);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, hydrate]);

  if (loading) {
    return (
      <div className="admin-card p-6">
        <LoadingRows rows={6} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-card p-6">
        <EmptyState
          icon={IconClipboard}
          title="Order not found"
          description="This order does not exist or the link is incorrect."
          action={
            <Link href="/admin/orders">
              <Button size="sm">Back to orders</Button>
            </Link>
          }
        />
      </div>
    );
  }

  async function reassignGuardian() {
    if (!guardianId) return;
    const updated = await api.assignGuardian(order!.id, guardianId);
    hydrate(updated);
    notify('Guardian reassigned.');
  }

  async function updateStatus() {
    const updated = await api.updateFulfillment(order!.id, statusValue);
    hydrate(updated);
    notify('Order status updated.');
  }

  async function saveNote() {
    const updated = await api.saveInternalNote(order!.id, note);
    hydrate(updated);
    notify('Internal note saved.');
  }

  async function onScreenshot(slot: 'before' | 'after', url: string | null) {
    const updated = await api.setScreenshot(order!.id, slot, url);
    hydrate(updated);
  }

  async function runAction() {
    if (!action || !order) return;
    setBusy(true);
    let updated: Order;
    if (action === 'complete') {
      updated = await api.completeOrder(order.id);
      notify('Order marked as completed.');
    } else if (action === 'cancel') {
      updated = await api.cancelOrder(order.id);
      notify('Order cancelled.');
    } else {
      updated = await api.requestRefund(order.id);
      notify('Refund requested (demo).');
    }
    hydrate(updated);
    setBusy(false);
    setAction(null);
  }

  const completionBlocked = !order.afterScreenshot;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <IconArrowLeft width={18} height={18} /> Back to orders
        </Link>
        <span className="font-display text-lg text-plum">Order {order.code}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Summary */}
          <Card>
            <CardHeader
              icon={<IconClipboard width={20} height={20} />}
              title="Order Summary"
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentBadge status={order.paymentStatus} />
                  <FulfillmentBadge status={order.fulfillmentStatus} />
                </div>
              }
            />
            <p className="mt-1 text-xs text-ink-muted">Created {formatDateTime(order.createdAt)}</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <ImageSlot imageKey={order.serviceImageKey} ratio="1 / 1" className="h-28 w-28 flex-shrink-0" alt={order.serviceName} />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl text-plum">{order.serviceName}</h3>
                {order.serviceTagline && <p className="text-sm text-ink-soft">{order.serviceTagline}</p>}
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem icon={<IconUser width={16} height={16} />} label="Traveler" value={order.traveler.name} />
                  <SummaryItem icon={<IconGlobe width={16} height={16} />} label="Server" value={order.config.find((c) => c.label === 'Server')?.value ?? '—'} />
                  <SummaryItem icon={<IconClock width={16} height={16} />} label="Quantity" value={order.config.find((c) => c.label === 'Quantity')?.value ?? `${order.progress.target} ${order.progress.unit}`} />
                  <SummaryItem icon={<IconCoins width={16} height={16} />} label="Amount" value={formatMoney(order.amountMinor, order.currency)} />
                </dl>
              </div>
            </div>
          </Card>

          {/* Guardian + Status */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader icon={<IconUser width={20} height={20} />} title="Guardian Assignment" subtitle="Assign a guardian to handle this order." />
              <div className="mt-4 flex items-end gap-2">
                <Select aria-label="Guardian" value={guardianId} onChange={(e) => setGuardianId(e.target.value)} className="flex-1">
                  <option value="">Unassigned</option>
                  {guardians.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </Select>
                <Button variant="outline" onClick={reassignGuardian} disabled={!guardianId || guardianId === order.guardianId}>
                  <IconRefresh width={16} height={16} /> Reassign
                </Button>
              </div>
            </Card>
            <Card>
              <CardHeader icon={<IconRefresh width={20} height={20} />} title="Order Status" subtitle="Update the current order status." />
              <div className="mt-4 flex items-end gap-2">
                <Select aria-label="Fulfillment status" value={statusValue} onChange={(e) => setStatusValue(e.target.value as FulfillmentStatus)} className="flex-1">
                  {Object.entries(FULFILLMENT_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
                <Button onClick={updateStatus} disabled={statusValue === order.fulfillmentStatus}>
                  Update status
                </Button>
              </div>
            </Card>
          </div>

          {/* Progress + Timeline */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader
                icon={<IconClipboard width={20} height={20} />}
                title="Progress"
                action={
                  <span className="text-sm font-semibold text-ink-soft">
                    {order.progress.current} / {order.progress.target} {order.progress.unit} (
                    {order.progress.target > 0 ? Math.round((order.progress.current / order.progress.target) * 100) : 0}%)
                  </span>
                }
              />
              <div className="mt-4">
                <ProgressBar value={order.progress.current} max={order.progress.target} />
                <div className="mt-3 rounded-2xl bg-blush-soft/60 p-3 text-sm text-ink-soft">
                  {order.progress.current} of {order.progress.target} {order.progress.unit} have been completed. Keep going! Update the status when the service is completed.
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader icon={<IconLightning width={20} height={20} />} title="Activity Timeline" />
              <div className="mt-4">
                <Timeline events={order.events} />
              </div>
            </Card>
          </div>

          {/* Service report */}
          <Card>
            <CardHeader icon={<IconPhoto width={20} height={20} />} title="Service Report" subtitle="Upload screenshots to show the service progress and completion." />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ImageUpload label="Before (Start Screenshot)" hint="PNG, JPG or WebP (Max 5MB)" ratio="16 / 9" value={order.beforeScreenshot} onChange={(url) => onScreenshot('before', url)} />
              <ImageUpload label="After (Completion Screenshot)" hint="PNG, JPG or WebP (Max 5MB)" ratio="16 / 9" value={order.afterScreenshot} onChange={(url) => onScreenshot('after', url)} />
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-2xl bg-info-soft p-3 text-sm text-info">
              <IconInfo width={18} height={18} className="mt-0.5 flex-shrink-0" />
              <p>Completion screenshot is required before marking the order as completed. Uploads here are <strong>local previews only</strong> in demo mode.</p>
            </div>
          </Card>

          {/* Payment breakdown + notes */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader icon={<IconCoins width={20} height={20} />} title="Payment Breakdown" />
              <dl className="mt-4 space-y-2.5 text-sm">
                <BreakdownRow label="Subtotal" value={formatMoney(order.breakdown.subtotalMinor, order.currency)} />
                <BreakdownRow label="Discount" value={formatMoney(order.breakdown.discountMinor, order.currency)} />
                <BreakdownRow label="Refund" value={formatMoney(order.breakdown.refundMinor, order.currency)} />
                <div className="border-t border-blush-soft pt-2.5">
                  <BreakdownRow label="Total Paid" value={formatMoney(order.breakdown.totalMinor, order.currency)} bold />
                </div>
              </dl>
            </Card>
            <Card>
              <CardHeader icon={<IconFile width={20} height={20} />} title="Internal Notes" subtitle="Add internal notes about this order (not visible to customer)." />
              <div className="mt-4">
                <Textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Write your notes here…" rows={4} />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-ink-muted">{note.length} / 500</span>
                  <Button size="sm" onClick={saveNote} disabled={note === order.internalNotes}>
                    <IconSave width={16} height={16} /> Save note
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions */}
          <Card>
            <CardHeader icon={<IconLightning width={20} height={20} />} title="Actions" />
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <ActionTile
                tone="primary"
                icon={<IconCheckCircle width={18} height={18} />}
                title="Complete order"
                desc={completionBlocked ? 'Upload a completion screenshot first.' : `Mark as completed when the full ${order.progress.target} ${order.progress.unit} delivered.`}
                disabled={order.fulfillmentStatus === 'completed' || order.fulfillmentStatus === 'cancelled' || completionBlocked}
                onClick={() => setAction('complete')}
              />
              <ActionTile
                tone="warn"
                icon={<IconRefresh width={18} height={18} />}
                title="Request refund"
                desc="Process a refund for this order. Requires confirmation."
                disabled={order.paymentStatus === 'refunded' || order.paymentStatus === 'pending'}
                onClick={() => setAction('refund')}
              />
              <ActionTile
                tone="danger"
                icon={<IconX width={18} height={18} />}
                title="Cancel order"
                desc="Cancel this order if it cannot be completed. Requires confirmation."
                disabled={order.fulfillmentStatus === 'cancelled' || order.fulfillmentStatus === 'completed'}
                onClick={() => setAction('cancel')}
              />
            </div>
          </Card>
        </div>

        {/* Side rail (desktop) */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <h3 className="font-display text-lg text-plum">At a glance</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <BreakdownRow label="Order" value={order.code} />
              <BreakdownRow label="Payment" value={<PaymentBadge status={order.paymentStatus} />} />
              <BreakdownRow label="Fulfillment" value={<FulfillmentBadge status={order.fulfillmentStatus} />} />
              <BreakdownRow label="Guardian" value={order.guardianName ?? 'Unassigned'} />
              <BreakdownRow label="Total" value={formatMoney(order.amountMinor, order.currency)} bold />
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={action === 'complete'}
        title="Complete this order?"
        description="This marks the order as completed and sets progress to 100%. (Demo — updates mock state only.)"
        confirmLabel="Complete order"
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
      <ConfirmDialog
        open={action === 'refund'}
        title="Request a refund?"
        description="This will mark the payment as refunded and set the paid total to zero. No real payment is processed. (Demo — updates mock state only.)"
        confirmLabel="Request refund"
        tone="danger"
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
      <ConfirmDialog
        open={action === 'cancel'}
        title="Cancel this order?"
        description="This cancels the order. This cannot be undone in a real system. (Demo — updates mock state only.)"
        confirmLabel="Cancel order"
        tone="danger"
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}

function SummaryItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-xs text-ink-muted">
        <span className="text-rose">{icon}</span>
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-plum">{value}</dd>
    </div>
  );
}

function BreakdownRow({ label, value, bold }: { label: string; value: React.ReactNode; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={bold ? 'font-semibold text-plum' : 'text-ink-soft'}>{label}</dt>
      <dd className={bold ? 'font-display text-lg font-semibold text-plum' : 'font-medium text-ink'}>{value}</dd>
    </div>
  );
}

function ActionTile({
  tone,
  icon,
  title,
  desc,
  disabled,
  onClick,
}: {
  tone: 'primary' | 'warn' | 'danger';
  icon: React.ReactNode;
  title: string;
  desc: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  const toneClasses = {
    primary: 'border-primary/30 bg-primary-soft/40 text-primary',
    warn: 'border-warn/30 bg-warn-soft/50 text-warn',
    danger: 'border-danger/30 bg-danger-soft/50 text-danger',
  }[tone];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClasses}`}
    >
      <span className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </span>
      <span className="mt-1 block text-xs text-ink-soft">{desc}</span>
    </button>
  );
}
