'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { FulfillmentStatus, Guardian, Order, StaffOption } from '@/types';
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
import { uploadImage } from '@/lib/upload';
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
import { useCurrentMember } from '@/lib/auth/useCurrentMember';
import { canMutate } from '@/lib/auth/roles';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';

type ActionKind = 'complete' | 'cancel' | 'refund' | null;

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { notify } = useToast();
  const { t } = useI18n();
  const { member } = useCurrentMember();
  // Non-mutating roles get a read-only order view; editing controls are hidden.
  // The server also enforces this (order mutations require MUTATE_ROLES).
  const canEdit = !member || canMutate(member.role);
  const [order, setOrder] = useState<Order | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [staff, setStaff] = useState<StaffOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardianId, setGuardianId] = useState<string>('');
  const [staffSelect, setStaffSelect] = useState<string>('');
  const [statusValue, setStatusValue] = useState<FulfillmentStatus>('pending');
  const [note, setNote] = useState('');
  const [action, setAction] = useState<ActionKind>(null);
  const [busy, setBusy] = useState(false);

  const hydrate = useCallback((o: Order) => {
    setOrder(o);
    setGuardianId(o.guardianId ?? '');
    setStaffSelect(o.assignment?.staffId ?? '');
    setStatusValue(o.fulfillmentStatus);
    setNote(o.internalNotes);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([api.getOrder(id), api.listGuardians(), api.listStaff()]).then(([o, g, s]) => {
      if (!active) return;
      if (o) hydrate(o);
      setGuardians(g);
      setStaff(s);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, hydrate]);

  // Near real-time: refresh the order (status, assignment, timeline) on an
  // interval. Only the display state is replaced — editable fields are left
  // alone, and polling pauses while a confirmation dialog or action is running.
  useEffect(() => {
    const timer = setInterval(() => {
      if (action || busy) return;
      api.getOrder(id).then((o) => o && setOrder(o));
    }, 20000);
    return () => clearInterval(timer);
  }, [id, action, busy]);

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
          title={t('od.notFound')}
          description={t('od.notFoundDesc')}
          action={
            <Link href="/admin/orders">
              <Button size="sm">{t('od.back')}</Button>
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
    notify(t('od.toastGuardianReassigned'));
  }

  async function setAssignee(staffId: string | null) {
    const updated = await api.assignStaff(order!.id, staffId);
    hydrate(updated);
    notify(staffId ? t('od.toastTaskAssigned') : t('od.toastAssignmentCleared'));
  }

  async function updateStatus() {
    const updated = await api.updateFulfillment(order!.id, statusValue);
    hydrate(updated);
    notify(t('od.toastStatusUpdated'));
  }

  async function saveNote() {
    const updated = await api.saveInternalNote(order!.id, note);
    hydrate(updated);
    notify(t('od.toastNoteSaved'));
  }

  async function onScreenshot(slot: 'before' | 'after', url: string | null, file: File | null) {
    try {
      // Upload the chosen file to Supabase Storage; persist the public URL.
      const stored = file ? await uploadImage(file, 'order-screenshots') : url;
      const updated = await api.setScreenshot(order!.id, slot, stored);
      hydrate(updated);
    } catch {
      notify(t('od.toastScreenshotFailed'), 'error');
    }
  }

  async function runAction() {
    if (!action || !order) return;
    setBusy(true);
    let updated: Order;
    if (action === 'complete') {
      updated = await api.completeOrder(order.id);
      notify(t('od.toastCompleted'));
    } else if (action === 'cancel') {
      updated = await api.cancelOrder(order.id);
      notify(t('od.toastCancelled'));
    } else {
      updated = await api.requestRefund(order.id);
      notify(t('od.toastRefund'));
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
          <IconArrowLeft width={18} height={18} /> {t('od.back')}
        </Link>
        <span className="font-display text-lg text-plum">{t('od.order')} {order.code}</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Summary */}
          <Card>
            <CardHeader
              icon={<IconClipboard width={20} height={20} />}
              title={t('od.summary')}
              action={
                <div className="flex flex-wrap items-center gap-2">
                  <PaymentBadge status={order.paymentStatus} />
                  <FulfillmentBadge status={order.fulfillmentStatus} />
                </div>
              }
            />
            <p className="mt-1 text-xs text-ink-muted">{t('od.created')} {formatDateTime(order.createdAt)}</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row">
              <ImageSlot imageKey={order.serviceImageKey} ratio="1 / 1" className="h-28 w-28 flex-shrink-0" alt={order.serviceName} />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl text-plum">{order.serviceName}</h3>
                {order.serviceTagline && <p className="text-sm text-ink-soft">{order.serviceTagline}</p>}
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <SummaryItem icon={<IconUser width={16} height={16} />} label={t('od.traveler')} value={order.traveler.name} />
                  <SummaryItem icon={<IconGlobe width={16} height={16} />} label={t('od.server')} value={order.config.find((c) => c.label === 'Server')?.value ?? '—'} />
                  <SummaryItem icon={<IconClock width={16} height={16} />} label={t('od.quantity')} value={order.config.find((c) => c.label === 'Quantity')?.value ?? `${order.progress.target} ${order.progress.unit}`} />
                  <SummaryItem icon={<IconCoins width={16} height={16} />} label={t('od.amount')} value={formatMoney(order.amountMinor, order.currency)} />
                </dl>
              </div>
            </div>
          </Card>

          {/* Guardian + Status */}
          {canEdit && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Card>
                <CardHeader icon={<IconUser width={20} height={20} />} title={t('od.guardianAssignment')} subtitle={t('od.guardianAssignmentSub')} />
                <div className="mt-4 flex items-end gap-2">
                  <Select aria-label={t('od.guardianAssignment')} value={guardianId} onChange={(e) => setGuardianId(e.target.value)} className="flex-1">
                    <option value="">{t('od.unassigned')}</option>
                    {guardians.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </Select>
                  <Button variant="outline" onClick={reassignGuardian} disabled={!guardianId || guardianId === order.guardianId}>
                    <IconRefresh width={16} height={16} /> {t('od.reassign')}
                  </Button>
                </div>
              </Card>
              <Card>
                <CardHeader icon={<IconRefresh width={20} height={20} />} title={t('od.orderStatus')} subtitle={t('od.orderStatusSub')} />
                <div className="mt-4 flex items-end gap-2">
                  <Select aria-label={t('od.orderStatus')} value={statusValue} onChange={(e) => setStatusValue(e.target.value as FulfillmentStatus)} className="flex-1">
                    {Object.keys(FULFILLMENT_STATUS_LABELS).map((value) => (
                      <option key={value} value={value}>
                        {t(`fulfillment.${value}` as TKey)}
                      </option>
                    ))}
                  </Select>
                  <Button onClick={updateStatus} disabled={statusValue === order.fulfillmentStatus}>
                    {t('od.updateStatus')}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Task Assignment — the team member responsible for this order.
              Shown to every role; the guardian role can only claim/release it themselves. */}
          <Card>
            <CardHeader
              icon={<IconUser width={20} height={20} />}
              title={t('od.taskAssignment')}
              subtitle={t('od.taskAssignmentSub')}
            />
            <div className="mt-4">
              {canEdit ? (
                <div className="flex items-end gap-2">
                  <Select aria-label={t('orderStatus.assigneeAria')} value={staffSelect} onChange={(e) => setStaffSelect(e.target.value)} className="flex-1">
                    <option value="">{t('od.unassigned')}</option>
                    {staff.map((s) => (
                      <option key={s.userId} value={s.userId}>
                        {s.email}
                      </option>
                    ))}
                  </Select>
                  <Button onClick={() => setAssignee(staffSelect || null)} disabled={staffSelect === (order.assignment?.staffId ?? '')}>
                    <IconUser width={16} height={16} /> {t('od.assign')}
                  </Button>
                </div>
              ) : order.assignment?.staffId === member?.userId ? (
                <Button variant="outline" onClick={() => setAssignee(null)}>
                  {t('od.release')}
                </Button>
              ) : (
                <Button onClick={() => setAssignee(member?.userId ?? null)} disabled={!member}>
                  <IconUser width={16} height={16} /> {t('od.assignToMe')}
                </Button>
              )}
              {order.assignment ? (
                <div className="mt-3 rounded-2xl bg-blush-soft/60 p-3 text-sm text-ink-soft">
                  <p className="font-semibold text-plum">{order.assignment.staffEmail ?? '—'}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {t('od.assignedBy')} {order.assignment.assignedByEmail ?? '—'}
                    {order.assignment.assignedAt ? ` · ${formatDateTime(order.assignment.assignedAt)}` : ''}
                  </p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-ink-muted">{t('od.noAssignee')}</p>
              )}
            </div>
          </Card>

          {/* Progress + Timeline */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader
                icon={<IconClipboard width={20} height={20} />}
                title={t('od.progress')}
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
                  {order.progress.current} / {order.progress.target} {order.progress.unit} {t('od.progressNote')}
                </div>
              </div>
            </Card>
            <Card>
              <CardHeader icon={<IconLightning width={20} height={20} />} title={t('od.activityTimeline')} />
              <div className="mt-4">
                <Timeline events={order.events} />
              </div>
            </Card>
          </div>

          {/* Service report */}
          {canEdit ? (
            <Card>
              <CardHeader icon={<IconPhoto width={20} height={20} />} title={t('od.serviceReport')} subtitle={t('od.serviceReportSub')} />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageUpload label={t('od.before')} hint={t('od.uploadHint')} ratio="16 / 9" value={order.beforeScreenshot} onChange={(url, file) => onScreenshot('before', url, file)} />
                <ImageUpload label={t('od.after')} hint={t('od.uploadHint')} ratio="16 / 9" value={order.afterScreenshot} onChange={(url, file) => onScreenshot('after', url, file)} />
              </div>
              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-info-soft p-3 text-sm text-info">
                <IconInfo width={18} height={18} className="mt-0.5 flex-shrink-0" />
                <p>{t('od.completionRequired')}</p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader icon={<IconPhoto width={20} height={20} />} title={t('od.serviceReport')} />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ImageSlot imageKey={order.beforeScreenshot} ratio="16 / 9" alt={t('od.beforeAlt')} />
                <ImageSlot imageKey={order.afterScreenshot} ratio="16 / 9" alt={t('od.afterAlt')} />
              </div>
            </Card>
          )}

          {/* Payment breakdown + notes */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Card>
              <CardHeader icon={<IconCoins width={20} height={20} />} title={t('od.paymentBreakdown')} />
              <dl className="mt-4 space-y-2.5 text-sm">
                <BreakdownRow label={t('od.subtotal')} value={formatMoney(order.breakdown.subtotalMinor, order.currency)} />
                <BreakdownRow label={t('od.discount')} value={formatMoney(order.breakdown.discountMinor, order.currency)} />
                <BreakdownRow label={t('od.refund')} value={formatMoney(order.breakdown.refundMinor, order.currency)} />
                <div className="border-t border-blush-soft pt-2.5">
                  <BreakdownRow label={t('od.totalPaid')} value={formatMoney(order.breakdown.totalMinor, order.currency)} bold />
                </div>
              </dl>
            </Card>
            <Card>
              <CardHeader icon={<IconFile width={20} height={20} />} title={t('od.internalNotes')} subtitle={t('od.internalNotesSub')} />
              <div className="mt-4">
                {canEdit ? (
                  <>
                    <Textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder={t('od.notesPlaceholder')} rows={4} />
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-ink-muted">{note.length} / 500</span>
                      <Button size="sm" onClick={saveNote} disabled={note === order.internalNotes}>
                        <IconSave width={16} height={16} /> {t('od.saveNote')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-ink-soft">
                    {order.internalNotes || t('od.noNotes')}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Actions */}
          {canEdit && (
            <Card>
              <CardHeader icon={<IconLightning width={20} height={20} />} title={t('od.actions')} />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <ActionTile
                  tone="primary"
                  icon={<IconCheckCircle width={18} height={18} />}
                  title={t('od.completeOrder')}
                  desc={completionBlocked ? t('od.completeBlocked') : t('od.completeDesc')}
                  disabled={order.fulfillmentStatus === 'completed' || order.fulfillmentStatus === 'cancelled' || completionBlocked}
                  onClick={() => setAction('complete')}
                />
                <ActionTile
                  tone="warn"
                  icon={<IconRefresh width={18} height={18} />}
                  title={t('od.requestRefund')}
                  desc={t('od.requestRefundDesc')}
                  disabled={order.paymentStatus === 'refunded' || order.paymentStatus === 'pending'}
                  onClick={() => setAction('refund')}
                />
                <ActionTile
                  tone="danger"
                  icon={<IconX width={18} height={18} />}
                  title={t('od.cancelOrder')}
                  desc={t('od.cancelOrderDesc')}
                  disabled={order.fulfillmentStatus === 'cancelled' || order.fulfillmentStatus === 'completed'}
                  onClick={() => setAction('cancel')}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Side rail (desktop) */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <h3 className="font-display text-lg text-plum">{t('od.atAGlance')}</h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <BreakdownRow label={t('od.order')} value={order.code} />
              <BreakdownRow label={t('orders.thPayment')} value={<PaymentBadge status={order.paymentStatus} />} />
              <BreakdownRow label={t('orders.thFulfillment')} value={<FulfillmentBadge status={order.fulfillmentStatus} />} />
              <BreakdownRow label={t('od.glanceGuardian')} value={order.guardianName ?? t('od.unassigned')} />
              <BreakdownRow label={t('od.glanceAssignedTo')} value={order.assignment?.staffEmail ?? t('od.unassigned')} />
              <BreakdownRow label={t('common.total')} value={formatMoney(order.amountMinor, order.currency)} bold />
            </dl>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={action === 'complete'}
        title={t('od.confirmCompleteTitle')}
        description={t('od.confirmCompleteDesc')}
        confirmLabel={t('od.completeOrder')}
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
      <ConfirmDialog
        open={action === 'refund'}
        title={t('od.confirmRefundTitle')}
        description={t('od.confirmRefundDesc')}
        confirmLabel={t('od.requestRefund')}
        tone="danger"
        busy={busy}
        onConfirm={runAction}
        onCancel={() => setAction(null)}
      />
      <ConfirmDialog
        open={action === 'cancel'}
        title={t('od.confirmCancelTitle')}
        description={t('od.confirmCancelDesc')}
        confirmLabel={t('od.cancelOrder')}
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
