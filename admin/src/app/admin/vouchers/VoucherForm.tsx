'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CurrencyCode, Service, VoucherDiscountType, VoucherInput } from '@/types';
import type { VoucherWithStatus } from '@/lib/api';
import { toMajor, toMinor } from '@/lib/money';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { RadioCard } from '@/components/ui/Radio';
import { Toggle } from '@/components/ui/Toggle';
import { IconPlus, IconX, IconChevronDown, IconTicket } from '@/components/ui/icons';

/** Convert an ISO datetime (with tz) to a `datetime-local` input value (MYT wall time). */
function isoToLocalInput(iso: string): string {
  // Keep the wall-clock portion; seed data is already expressed in +08:00.
  return iso.slice(0, 16);
}
function localInputToIso(local: string): string {
  return local.length === 16 ? `${local}:00+08:00` : local;
}

interface FormState {
  code: string;
  internalName: string;
  discountType: VoucherDiscountType;
  valueMajor: string;
  percent: string;
  currency: CurrencyCode;
  minSpendMajor: string;
  maxDiscountMajor: string;
  eligibleServiceIds: string[];
  startLocal: string;
  endLocal: string;
  totalLimit: string;
  perCustomerLimit: string;
  active: boolean;
}

function blankState(): FormState {
  return {
    code: '',
    internalName: '',
    discountType: 'fixed',
    valueMajor: '',
    percent: '',
    currency: 'MYR',
    minSpendMajor: '',
    maxDiscountMajor: '',
    eligibleServiceIds: [],
    startLocal: '',
    endLocal: '',
    totalLimit: '',
    perCustomerLimit: '1',
    active: true,
  };
}

function toFormState(v: VoucherWithStatus): FormState {
  return {
    code: v.code,
    internalName: v.internalName,
    discountType: v.discountType,
    valueMajor: v.valueMinor != null ? String(toMajor(v.valueMinor)) : '',
    percent: v.percent != null ? String(v.percent) : '',
    currency: v.currency,
    minSpendMajor: String(toMajor(v.minSpendMinor)),
    maxDiscountMajor: v.maxDiscountMinor != null ? String(toMajor(v.maxDiscountMinor)) : '',
    eligibleServiceIds: [...v.eligibleServiceIds],
    startLocal: isoToLocalInput(v.startAt),
    endLocal: isoToLocalInput(v.endAt),
    totalLimit: String(v.totalLimit),
    perCustomerLimit: String(v.perCustomerLimit),
    active: v.active,
  };
}

export interface VoucherFormProps {
  editing: VoucherWithStatus | null;
  services: Service[];
  onSubmit: (input: VoucherInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function VoucherForm({ editing, services, onSubmit, onCancelEdit }: VoucherFormProps) {
  const [form, setForm] = useState<FormState>(() => (editing ? toFormState(editing) : blankState()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);

  useEffect(() => {
    setForm(editing ? toFormState(editing) : blankState());
    setErrors({});
  }, [editing]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const selectedServices = useMemo(
    () => services.filter((s) => form.eligibleServiceIds.includes(s.id)),
    [services, form.eligibleServiceIds],
  );

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.code.trim()) next.code = 'Voucher code is required.';
    if (!form.internalName.trim()) next.internalName = 'Internal name is required.';
    if (form.discountType === 'fixed') {
      if (!form.valueMajor.trim() || toMinor(form.valueMajor) <= 0) next.value = 'Enter a discount greater than 0.';
    } else {
      const p = Number(form.percent);
      if (!form.percent.trim() || p <= 0 || p > 100) next.value = 'Enter a percentage between 1 and 100.';
    }
    if (!form.startLocal) next.start = 'Start date is required.';
    if (!form.endLocal) next.end = 'End date is required.';
    if (form.startLocal && form.endLocal && form.endLocal <= form.startLocal) next.end = 'End must be after start.';
    if (!form.totalLimit.trim() || Number(form.totalLimit) < 1) next.totalLimit = 'Must be at least 1.';
    if (!form.perCustomerLimit.trim() || Number(form.perCustomerLimit) < 1) next.perCustomerLimit = 'Must be at least 1.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const input: VoucherInput = {
      code: form.code.trim().toUpperCase(),
      internalName: form.internalName.trim(),
      discountType: form.discountType,
      valueMinor: form.discountType === 'fixed' ? toMinor(form.valueMajor) : null,
      percent: form.discountType === 'percentage' ? Number(form.percent) : null,
      currency: form.currency,
      minSpendMinor: toMinor(form.minSpendMajor || '0'),
      maxDiscountMinor:
        form.discountType === 'percentage' && form.maxDiscountMajor.trim()
          ? toMinor(form.maxDiscountMajor)
          : null,
      eligibleServiceIds: form.eligibleServiceIds,
      startAt: localInputToIso(form.startLocal),
      endAt: localInputToIso(form.endLocal),
      totalLimit: Number(form.totalLimit),
      perCustomerLimit: Number(form.perCustomerLimit),
      active: form.active,
    };
    await onSubmit(input);
    setSaving(false);
    if (!editing) setForm(blankState());
  }

  function toggleService(id: string) {
    set(
      'eligibleServiceIds',
      form.eligibleServiceIds.includes(id)
        ? form.eligibleServiceIds.filter((x) => x !== id)
        : [...form.eligibleServiceIds, id],
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
          <IconPlus width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-lg text-plum">{editing ? 'Edit voucher' : 'Create new voucher'}</h2>
          <p className="text-sm text-ink-soft">
            {editing ? `Editing ${editing.code}.` : 'Set up a new voucher code for your store.'}
          </p>
        </div>
      </div>

      <Field label="Voucher code" required htmlFor="v-code" hint="A unique code that customers will enter at checkout." error={errors.code}>
        <Input id="v-code" value={form.code} invalid={!!errors.code} onChange={(e) => set('code', e.target.value)} placeholder="WELCOME5" />
      </Field>

      <Field label="Internal name" required htmlFor="v-name" hint="For your reference only (not visible to customers)." error={errors.internalName}>
        <Input id="v-name" value={form.internalName} invalid={!!errors.internalName} onChange={(e) => set('internalName', e.target.value)} placeholder="Welcome Reward" />
      </Field>

      <Field label="Discount type" required>
        <div className="grid grid-cols-2 gap-2">
          <RadioCard name="discountType" value="fixed" checked={form.discountType === 'fixed'} onChange={(v) => set('discountType', v as VoucherDiscountType)} title="Fixed amount" description="E.g. RM 5 off" compact />
          <RadioCard name="discountType" value="percentage" checked={form.discountType === 'percentage'} onChange={(v) => set('discountType', v as VoucherDiscountType)} title="Percentage" description="E.g. 10% off" compact />
        </div>
      </Field>

      {form.discountType === 'fixed' ? (
        <Field label="Discount value" required htmlFor="v-value" hint={`This voucher gives ${form.currency === 'MYR' ? 'RM' : '¥'} ${form.valueMajor || '0'} discount.`} error={errors.value}>
          <Input
            id="v-value"
            inputMode="decimal"
            value={form.valueMajor}
            invalid={!!errors.value}
            onChange={(e) => set('valueMajor', e.target.value)}
            placeholder="5.00"
            rightSlot={
              <Select aria-label="Currency" value={form.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)} className="h-9 w-24 rounded-xl">
                <option value="MYR">MYR (RM)</option>
                <option value="CNY">CNY (¥)</option>
              </Select>
            }
          />
        </Field>
      ) : (
        <>
          <Field label="Discount value" required htmlFor="v-percent" hint="Percentage off the eligible order." error={errors.value}>
            <Input id="v-percent" inputMode="numeric" value={form.percent} invalid={!!errors.value} onChange={(e) => set('percent', e.target.value)} placeholder="10" rightSlot={<span className="pr-3 text-sm text-ink-muted">%</span>} />
          </Field>
          <Field label="Maximum discount" htmlFor="v-max" hint="Optional cap on the discount amount.">
            <Input id="v-max" inputMode="decimal" value={form.maxDiscountMajor} onChange={(e) => set('maxDiscountMajor', e.target.value)} placeholder="50.00" rightSlot={<span className="pr-3 text-sm text-ink-muted">{form.currency === 'MYR' ? 'RM' : '¥'}</span>} />
          </Field>
        </>
      )}

      <Field label="Minimum spend" htmlFor="v-min" hint="Minimum order amount required to use this voucher.">
        <Input id="v-min" inputMode="decimal" value={form.minSpendMajor} onChange={(e) => set('minSpendMajor', e.target.value)} placeholder="20.00" rightSlot={<span className="pr-3 text-sm text-ink-muted">{form.currency === 'MYR' ? 'RM' : '¥'}</span>} />
      </Field>

      {/* Eligible services multi-select */}
      <Field label="Eligible services" required hint="Select which services this voucher can be used for. Leave empty for all services.">
        <div className="relative">
          <button type="button" onClick={() => setServiceMenuOpen((o) => !o)} className="flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-2xl border border-blush-deep/50 bg-white px-3 py-2 text-left">
            {selectedServices.length === 0 ? (
              <span className="text-sm text-ink-muted">All services</span>
            ) : (
              selectedServices.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 rounded-full bg-blush px-2.5 py-1 text-xs font-semibold text-primary">
                  {s.name}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${s.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleService(s.id);
                    }}
                    className="cursor-pointer"
                  >
                    <IconX width={12} height={12} />
                  </span>
                </span>
              ))
            )}
            <IconChevronDown width={16} height={16} className="ml-auto text-ink-muted" />
          </button>
          {serviceMenuOpen && (
            <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-blush-soft bg-white py-1 shadow-lift">
              {services.map((s) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-blush-soft">
                  <input type="checkbox" checked={form.eligibleServiceIds.includes(s.id)} onChange={() => toggleService(s.id)} className="h-4 w-4 accent-primary" />
                  {s.name}
                </label>
              ))}
            </div>
          )}
        </div>
      </Field>

      {/* Validity */}
      <Field label="Validity period (MYT)" required hint="Time zone: Malaysia Time (MYT, UTC+8)." error={errors.start || errors.end}>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <span className="mb-1 block text-xs text-ink-muted">Start date &amp; time</span>
            <Input type="datetime-local" value={form.startLocal} invalid={!!errors.start} onChange={(e) => set('startLocal', e.target.value)} />
          </div>
          <div>
            <span className="mb-1 block text-xs text-ink-muted">End date &amp; time</span>
            <Input type="datetime-local" value={form.endLocal} invalid={!!errors.end} onChange={(e) => set('endLocal', e.target.value)} />
          </div>
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Total redemption limit" required htmlFor="v-total" error={errors.totalLimit}>
          <Input id="v-total" inputMode="numeric" value={form.totalLimit} invalid={!!errors.totalLimit} onChange={(e) => set('totalLimit', e.target.value)} placeholder="500" />
        </Field>
        <Field label="Per-customer limit" required htmlFor="v-per" error={errors.perCustomerLimit}>
          <Input id="v-per" inputMode="numeric" value={form.perCustomerLimit} invalid={!!errors.perCustomerLimit} onChange={(e) => set('perCustomerLimit', e.target.value)} placeholder="1" />
        </Field>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-blush-soft bg-surface-soft p-3">
        <div>
          <p className="text-sm font-semibold text-plum">Active</p>
          <p className="text-xs text-ink-soft">Make this voucher available for use by customers.</p>
        </div>
        <Toggle checked={form.active} onChange={(v) => set('active', v)} label="Active" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {editing && (
          <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" block disabled={saving}>
          <IconTicket width={18} height={18} /> {saving ? 'Saving…' : editing ? 'Update voucher' : 'Save voucher'}
        </Button>
      </div>
    </form>
  );
}
