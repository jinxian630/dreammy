'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  CurrencyCode,
  Service,
  ServiceCategory,
  ServiceDuration,
  ServiceInput,
  ServiceOption,
  ServerRegion,
} from '@/types';
import { SERVICE_CATEGORY_LABELS, SERVICE_DURATION_LABELS } from '@/types';
import { api } from '@/lib/api';
import { formatMoney } from '@/lib/money';
import { toMajor, toMinor } from '@/lib/money';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { RadioCard, RadioPill } from '@/components/ui/Radio';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import {
  IconFile,
  IconSettings,
  IconClock,
  IconGlobe,
  IconCoins,
  IconSave,
  IconSend,
  IconPlus,
  IconTrash,
  IconEye,
} from '@/components/ui/icons';

interface FormState {
  name: string;
  category: ServiceCategory;
  description: string;
  imageKey: string | null;
  imagePreview: string | null;
  server: ServerRegion;
  duration: ServiceDuration;
  options: ServiceOption[];
  preferredTime: string;
  priceMajor: string;
  currency: CurrencyCode;
  estimatedCompletion: string;
  status: 'active' | 'draft';
  customerInstructions: string;
}

function toFormState(service?: Service): FormState {
  return {
    name: service?.name ?? '',
    category: service?.category ?? 'candle-runs',
    description: service?.description ?? '',
    imageKey: service?.imageKey ?? null,
    imagePreview: null,
    server: service?.server ?? 'global',
    duration: service?.duration ?? '1d',
    options: service?.options ? structuredClone(service.options) : [],
    preferredTime: service?.preferredTime ?? '',
    priceMajor: service ? String(toMajor(service.priceMinor)) : '',
    currency: service?.currency ?? 'MYR',
    estimatedCompletion: service?.estimatedCompletion ?? '1 day',
    status: service?.status === 'draft' ? 'draft' : 'active',
    customerInstructions: service?.customerInstructions ?? '',
  };
}

export function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const { notify } = useToast();
  const isEdit = Boolean(service);
  const [form, setForm] = useState<FormState>(() => toFormState(service));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const priceMinor = useMemo(() => toMinor(form.priceMajor || '0'), [form.priceMajor]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Service name is required.';
    if (!form.description.trim()) next.description = 'Description is required.';
    if (!form.priceMajor.trim() || priceMinor <= 0) next.price = 'Enter a price greater than 0.';
    if (!form.estimatedCompletion.trim()) next.estimatedCompletion = 'Estimated time is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(status: 'active' | 'draft') {
    if (!validate()) {
      notify('Please fix the highlighted fields.', 'error');
      return;
    }
    setSaving(status === 'active' ? 'publish' : 'draft');
    const input: ServiceInput = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      priceMinor,
      currency: form.currency,
      // In demo mode the local object URL is kept as the preview; a real backend
      // would return a stored path here after upload.
      imageKey: form.imagePreview ?? form.imageKey,
      status,
      server: form.server,
      duration: form.duration,
      options: form.options.filter((o) => o.label.trim() && o.values.length > 0),
      preferredTime: form.preferredTime.trim() || null,
      estimatedCompletion: form.estimatedCompletion.trim(),
      customerInstructions: form.customerInstructions.trim(),
    };
    try {
      if (isEdit && service) {
        await api.updateService(service.id, input);
      } else {
        await api.createService(input);
      }
      notify(status === 'active' ? 'Service published.' : 'Draft saved.');
      router.push('/admin/services');
    } catch {
      notify('Something went wrong. Please try again.', 'error');
      setSaving(null);
    }
  }

  // ---- option group helpers ----
  function addOption() {
    set('options', [...form.options, { key: `opt-${Date.now()}`, label: '', values: [], defaultValue: '' }]);
  }
  function updateOption(idx: number, patch: Partial<ServiceOption>) {
    set(
      'options',
      form.options.map((o, i) => (i === idx ? { ...o, ...patch } : o)),
    );
  }
  function removeOption(idx: number) {
    set('options', form.options.filter((_, i) => i !== idx));
  }

  const previewImageKey = form.imagePreview ?? form.imageKey;

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Edit Service' : 'Add New Service'}
        subtitle="Create a new Sky game service for your Dreammy store."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Basic information */}
          <Card>
            <CardHeader
              icon={<IconFile width={20} height={20} />}
              title="Basic information"
              subtitle="Set the basic details of your service."
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Service name" required htmlFor="name" hint="A clear and concise name for your service." error={errors.name}>
                <Input id="name" value={form.name} invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} placeholder="Daily Candle Run" />
              </Field>
              <Field label="Category" required htmlFor="category" hint="Choose the most relevant category.">
                <Select id="category" value={form.category} onChange={(e) => set('category', e.target.value as ServiceCategory)}>
                  {Object.entries(SERVICE_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              className="mt-4"
              label="Description"
              required
              htmlFor="description"
              hint="Describe what the service includes, benefits, and any important details."
              error={errors.description}
            >
              <Textarea
                id="description"
                value={form.description}
                invalid={!!errors.description}
                maxLength={500}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Fast and reliable candle run by experienced players…"
              />
              <div className="mt-1 text-right text-xs text-ink-muted">{form.description.length}/500</div>
            </Field>
          </Card>

          {/* Service options */}
          <Card>
            <CardHeader
              icon={<IconSettings width={20} height={20} />}
              title="Service options"
              subtitle="Configure the game-specific options for this service."
            />
            <div className="mt-4">
              <ImageUpload
                label="Service image"
                hint="Recommended 1280×720 (16:9)"
                value={form.imagePreview}
                onChange={(url) => set('imagePreview', url)}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Server" required>
                <div className="flex flex-wrap gap-4 pt-1">
                  <RadioPill name="server" value="global" checked={form.server === 'global'} onChange={(v) => set('server', v as ServerRegion)}>
                    Global (International)
                  </RadioPill>
                  <RadioPill name="server" value="china" checked={form.server === 'china'} onChange={(v) => set('server', v as ServerRegion)}>
                    China
                  </RadioPill>
                </div>
              </Field>
              <Field label="Duration" required>
                <div className="flex flex-wrap gap-4 pt-1">
                  {(Object.keys(SERVICE_DURATION_LABELS) as ServiceDuration[]).map((d) => (
                    <RadioPill key={d} name="duration" value={d} checked={form.duration === d} onChange={(v) => set('duration', v as ServiceDuration)}>
                      {SERVICE_DURATION_LABELS[d]}
                    </RadioPill>
                  ))}
                </div>
              </Field>
            </div>

            {/* Configurable option groups */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="field-label mb-0">Configurable options</span>
                <Button variant="ghost" size="sm" onClick={addOption}>
                  <IconPlus width={16} height={16} /> Add option
                </Button>
              </div>
              {form.options.length === 0 ? (
                <p className="field-hint">No extra options. Add one (e.g. “Target candles”) to let customers choose.</p>
              ) : (
                <div className="mt-2 space-y-3">
                  {form.options.map((opt, idx) => (
                    <div key={opt.key} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Option label" htmlFor={`opt-label-${idx}`}>
                          <Input
                            id={`opt-label-${idx}`}
                            value={opt.label}
                            onChange={(e) => updateOption(idx, { label: e.target.value })}
                            placeholder="Target candles"
                          />
                        </Field>
                        <Field label="Choices (comma separated)" htmlFor={`opt-values-${idx}`}>
                          <Input
                            id={`opt-values-${idx}`}
                            value={opt.values.join(', ')}
                            onChange={(e) => {
                              const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
                              updateOption(idx, { values, defaultValue: values.includes(opt.defaultValue) ? opt.defaultValue : values[0] ?? '' });
                            }}
                            placeholder="15 candles, 20 candles"
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <Field label="Default choice" htmlFor={`opt-default-${idx}`} className="max-w-xs">
                          <Select id={`opt-default-${idx}`} value={opt.defaultValue} onChange={(e) => updateOption(idx, { defaultValue: e.target.value })}>
                            {opt.values.length === 0 && <option value="">—</option>}
                            {opt.values.map((v) => (
                              <option key={v} value={v}>
                                {v}
                              </option>
                            ))}
                          </Select>
                        </Field>
                        <Button variant="danger" size="sm" onClick={() => removeOption(idx)}>
                          <IconTrash width={15} height={15} /> Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field className="mt-4" label="Preferred time (optional)" htmlFor="preferredTime" hint="We will try to accommodate your preferred time (GMT+8).">
              <Input id="preferredTime" value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} placeholder="Select preferred time (e.g. evening)" />
            </Field>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader icon={<IconCoins width={20} height={20} />} title="Pricing" subtitle="Set the price for this service." />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Base price" required htmlFor="price" error={errors.price} hint="Set a fair price based on the service details.">
                <Input id="price" inputMode="decimal" value={form.priceMajor} invalid={!!errors.price} onChange={(e) => set('priceMajor', e.target.value)} placeholder="8.00" />
              </Field>
              <Field label="Currency" htmlFor="currency">
                <Select id="currency" value={form.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)}>
                  <option value="MYR">MYR (RM)</option>
                  <option value="CNY">CNY (¥)</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader icon={<IconClock width={20} height={20} />} title="Availability" subtitle="Set the service status and completion details." />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Availability" required>
                <div className="space-y-2">
                  <RadioCard name="status" value="active" checked={form.status === 'active'} onChange={(v) => set('status', v as 'active')} tone="success" title="Active" description="Visible in your store and can be purchased." />
                  <RadioCard name="status" value="draft" checked={form.status === 'draft'} onChange={(v) => set('status', v as 'draft')} title="Draft" description="Save as draft, not visible to customers." />
                </div>
              </Field>
              <Field label="Estimated completion time" required htmlFor="eta" error={errors.estimatedCompletion} hint="The usual time to complete this service after order confirmation.">
                <Select id="eta" value={form.estimatedCompletion} onChange={(e) => set('estimatedCompletion', e.target.value)}>
                  <option value="1 day">1 day</option>
                  <option value="3 days">3 days</option>
                  <option value="7 days">7 days</option>
                  <option value="30 days">30 days</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Customer instructions */}
          <Card>
            <CardHeader icon={<IconFile width={20} height={20} />} title="Customer instructions" subtitle="Provide important information for customers." />
            <Field className="mt-4" htmlFor="instructions" hint="Include any requirements, preparation, or notes for customers.">
              <Textarea id="instructions" value={form.customerInstructions} maxLength={500} onChange={(e) => set('customerInstructions', e.target.value)} placeholder="Please make sure your Sky account is linked…" />
              <div className="mt-1 text-right text-xs text-ink-muted">{form.customerInstructions.length}/500</div>
            </Field>
          </Card>

          {/* Actions (mobile shows here; desktop also shows sticky footer) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => submit('draft')} disabled={saving !== null}>
              <IconSave width={18} height={18} /> {saving === 'draft' ? 'Saving…' : 'Save as draft'}
            </Button>
            <Button onClick={() => submit('active')} disabled={saving !== null}>
              <IconSend width={18} height={18} /> {saving === 'publish' ? 'Publishing…' : 'Publish service'}
            </Button>
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader icon={<IconEye width={20} height={20} />} title="Service preview" subtitle="This is how your service will appear in the store." />
            <div className="mt-4 rounded-2xl border border-blush-soft p-3">
              <div className="relative">
                <ImageSlot imageKey={previewImageKey} ratio="16 / 10" alt={form.name || 'Service image'} />
                <Badge tone="blush" className="absolute right-2 top-2">
                  {SERVICE_CATEGORY_LABELS[form.category]}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-xl text-plum">{form.name || 'Service name'}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-primary">
                  {formatMoney(priceMinor, form.currency)}
                </span>
                <Badge tone={form.status === 'active' ? 'success' : 'warn'}>
                  {form.status === 'active' ? 'Active' : 'Draft'}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {form.options.map(
                  (o) => o.label && <li key={o.key} className="flex items-center gap-2"><IconSettings width={15} height={15} className="text-rose" /> {o.label}: {o.defaultValue || o.values[0]}</li>,
                )}
                <li className="flex items-center gap-2"><IconClock width={15} height={15} className="text-rose" /> {form.estimatedCompletion}</li>
                <li className="flex items-center gap-2"><IconGlobe width={15} height={15} className="text-rose" /> {form.server === 'global' ? 'Global (International)' : 'China'}</li>
              </ul>
              {form.description && <p className="mt-3 text-sm text-ink-soft">{form.description}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
