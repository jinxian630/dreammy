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
import { uploadImage } from '@/lib/upload';
import { ImageSlot } from '@/components/admin/ImageSlot';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';
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
  imageFile: File | null;
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
    imageFile: null,
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
  const { t } = useI18n();
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
    if (!form.name.trim()) next.name = t('sf.errNameReq');
    if (!form.description.trim()) next.description = t('sf.errDescReq');
    if (!form.priceMajor.trim() || priceMinor <= 0) next.price = t('sf.errPrice');
    if (!form.estimatedCompletion.trim()) next.estimatedCompletion = t('sf.errEta');
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(status: 'active' | 'draft') {
    if (!validate()) {
      notify(t('sf.fixFields'), 'error');
      return;
    }
    setSaving(status === 'active' ? 'publish' : 'draft');
    let imageKey = form.imageKey;
    try {
      // Upload a newly chosen file to Supabase Storage; store the public URL.
      if (form.imageFile) {
        imageKey = await uploadImage(form.imageFile, 'service-images');
      }
    } catch {
      notify(t('sf.imgUploadFailed'), 'error');
      setSaving(null);
      return;
    }
    const input: ServiceInput = {
      name: form.name.trim(),
      category: form.category,
      description: form.description.trim(),
      priceMinor,
      currency: form.currency,
      imageKey,
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
      notify(status === 'active' ? t('sv.servicePublished') : t('sf.draftSaved'));
      router.push('/admin/services');
    } catch {
      notify(t('sf.wentWrong'), 'error');
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
        title={isEdit ? t('sf.editTitle') : t('sf.addTitle')}
        subtitle={t('sf.subtitle')}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Form column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Basic information */}
          <Card>
            <CardHeader
              icon={<IconFile width={20} height={20} />}
              title={t('sf.basicInfo')}
              subtitle={t('sf.basicInfoSub')}
            />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('sf.serviceName')} required htmlFor="name" hint={t('sf.serviceNameHint')} error={errors.name}>
                <Input id="name" value={form.name} invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} placeholder={t('sf.serviceNamePh')} />
              </Field>
              <Field label={t('sf.category')} required htmlFor="category" hint={t('sf.categoryHint')}>
                <Select id="category" value={form.category} onChange={(e) => set('category', e.target.value as ServiceCategory)}>
                  {Object.keys(SERVICE_CATEGORY_LABELS).map((value) => (
                    <option key={value} value={value}>
                      {t(`category.${value}` as TKey)}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field
              className="mt-4"
              label={t('sf.description')}
              required
              htmlFor="description"
              hint={t('sf.descriptionHint')}
              error={errors.description}
            >
              <Textarea
                id="description"
                value={form.description}
                invalid={!!errors.description}
                maxLength={500}
                onChange={(e) => set('description', e.target.value)}
                placeholder={t('sf.descriptionPh')}
              />
              <div className="mt-1 text-right text-xs text-ink-muted">{form.description.length}/500</div>
            </Field>
          </Card>

          {/* Service options */}
          <Card>
            <CardHeader
              icon={<IconSettings width={20} height={20} />}
              title={t('sf.serviceOptions')}
              subtitle={t('sf.serviceOptionsSub')}
            />
            <div className="mt-4">
              <ImageUpload
                label={t('sf.serviceImage')}
                hint={t('sf.serviceImageHint')}
                value={form.imagePreview}
                onChange={(url, file) => {
                  set('imagePreview', url);
                  set('imageFile', file);
                }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('sf.server')} required>
                <div className="flex flex-wrap gap-4 pt-1">
                  <RadioPill name="server" value="global" checked={form.server === 'global'} onChange={(v) => set('server', v as ServerRegion)}>
                    {t('sf.global')}
                  </RadioPill>
                  <RadioPill name="server" value="china" checked={form.server === 'china'} onChange={(v) => set('server', v as ServerRegion)}>
                    {t('sf.china')}
                  </RadioPill>
                </div>
              </Field>
              <Field label={t('sf.duration')} required>
                <div className="flex flex-wrap gap-4 pt-1">
                  {(Object.keys(SERVICE_DURATION_LABELS) as ServiceDuration[]).map((d) => (
                    <RadioPill key={d} name="duration" value={d} checked={form.duration === d} onChange={(v) => set('duration', v as ServiceDuration)}>
                      {t(`duration.${d}` as TKey)}
                    </RadioPill>
                  ))}
                </div>
              </Field>
            </div>

            {/* Configurable option groups */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="field-label mb-0">{t('sf.configurableOptions')}</span>
                <Button variant="ghost" size="sm" onClick={addOption}>
                  <IconPlus width={16} height={16} /> {t('sf.addOption')}
                </Button>
              </div>
              {form.options.length === 0 ? (
                <p className="field-hint">{t('sf.noOptions')}</p>
              ) : (
                <div className="mt-2 space-y-3">
                  {form.options.map((opt, idx) => (
                    <div key={opt.key} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label={t('sf.optionLabel')} htmlFor={`opt-label-${idx}`}>
                          <Input
                            id={`opt-label-${idx}`}
                            value={opt.label}
                            onChange={(e) => updateOption(idx, { label: e.target.value })}
                            placeholder={t('sf.optionLabelPh')}
                          />
                        </Field>
                        <Field label={t('sf.choices')} htmlFor={`opt-values-${idx}`}>
                          <Input
                            id={`opt-values-${idx}`}
                            value={opt.values.join(', ')}
                            onChange={(e) => {
                              const values = e.target.value.split(',').map((v) => v.trim()).filter(Boolean);
                              updateOption(idx, { values, defaultValue: values.includes(opt.defaultValue) ? opt.defaultValue : values[0] ?? '' });
                            }}
                            placeholder={t('sf.choicesPh')}
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex items-end justify-between gap-3">
                        <Field label={t('sf.defaultChoice')} htmlFor={`opt-default-${idx}`} className="max-w-xs">
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
                          <IconTrash width={15} height={15} /> {t('sf.removeOption')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Field className="mt-4" label={t('sf.preferredTime')} htmlFor="preferredTime" hint={t('sf.preferredTimeHint')}>
              <Input id="preferredTime" value={form.preferredTime} onChange={(e) => set('preferredTime', e.target.value)} placeholder={t('sf.preferredTimePh')} />
            </Field>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader icon={<IconCoins width={20} height={20} />} title={t('sf.pricing')} subtitle={t('sf.pricingSub')} />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('sf.basePrice')} required htmlFor="price" error={errors.price} hint={t('sf.basePriceHint')}>
                <Input id="price" inputMode="decimal" value={form.priceMajor} invalid={!!errors.price} onChange={(e) => set('priceMajor', e.target.value)} placeholder="8.00" />
              </Field>
              <Field label={t('sf.currency')} htmlFor="currency">
                <Select id="currency" value={form.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)}>
                  <option value="MYR">MYR (RM)</option>
                  <option value="CNY">CNY (¥)</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader icon={<IconClock width={20} height={20} />} title={t('sf.availability')} subtitle={t('sf.availabilitySub')} />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label={t('sf.availability')} required>
                <div className="space-y-2">
                  <RadioCard name="status" value="active" checked={form.status === 'active'} onChange={(v) => set('status', v as 'active')} tone="success" title={t('sf.activeTitle')} description={t('sf.activeDesc')} />
                  <RadioCard name="status" value="draft" checked={form.status === 'draft'} onChange={(v) => set('status', v as 'draft')} title={t('sf.draftTitle')} description={t('sf.draftDesc')} />
                </div>
              </Field>
              <Field label={t('sf.eta')} required htmlFor="eta" error={errors.estimatedCompletion} hint={t('sf.etaHint')}>
                <Select id="eta" value={form.estimatedCompletion} onChange={(e) => set('estimatedCompletion', e.target.value)}>
                  <option value="1 day">{t('duration.1d')}</option>
                  <option value="3 days">{t('sf.eta3')}</option>
                  <option value="7 days">{t('duration.7d')}</option>
                  <option value="30 days">{t('duration.30d')}</option>
                </Select>
              </Field>
            </div>
          </Card>

          {/* Customer instructions */}
          <Card>
            <CardHeader icon={<IconFile width={20} height={20} />} title={t('sf.customerInstructions')} subtitle={t('sf.customerInstructionsSub')} />
            <Field className="mt-4" htmlFor="instructions" hint={t('sf.instructionsHint')}>
              <Textarea id="instructions" value={form.customerInstructions} maxLength={500} onChange={(e) => set('customerInstructions', e.target.value)} placeholder={t('sf.instructionsPh')} />
              <div className="mt-1 text-right text-xs text-ink-muted">{form.customerInstructions.length}/500</div>
            </Field>
          </Card>

          {/* Actions (mobile shows here; desktop also shows sticky footer) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => submit('draft')} disabled={saving !== null}>
              <IconSave width={18} height={18} /> {saving === 'draft' ? t('sf.savingDraft') : t('sf.saveDraft')}
            </Button>
            <Button onClick={() => submit('active')} disabled={saving !== null}>
              <IconSend width={18} height={18} /> {saving === 'publish' ? t('sf.publishing') : t('sf.publishService')}
            </Button>
          </div>
        </div>

        {/* Live preview column */}
        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-24">
            <CardHeader icon={<IconEye width={20} height={20} />} title={t('sf.servicePreview')} subtitle={t('sf.servicePreviewSub')} />
            <div className="mt-4 rounded-2xl border border-blush-soft p-3">
              <div className="relative">
                <ImageSlot imageKey={previewImageKey} ratio="16 / 10" alt={form.name || t('sf.serviceImageAlt')} />
                <Badge tone="blush" className="absolute right-2 top-2">
                  {t(`category.${form.category}` as TKey)}
                </Badge>
              </div>
              <h3 className="mt-3 font-display text-xl text-plum">{form.name || t('sf.serviceNameFallback')}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-display text-lg font-semibold text-primary">
                  {formatMoney(priceMinor, form.currency)}
                </span>
                <Badge tone={form.status === 'active' ? 'success' : 'warn'}>
                  {form.status === 'active' ? t('serviceStatus.active') : t('serviceStatus.draft')}
                </Badge>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-soft">
                {form.options.map(
                  (o) => o.label && <li key={o.key} className="flex items-center gap-2"><IconSettings width={15} height={15} className="text-rose" /> {o.label}: {o.defaultValue || o.values[0]}</li>,
                )}
                <li className="flex items-center gap-2"><IconClock width={15} height={15} className="text-rose" /> {form.estimatedCompletion}</li>
                <li className="flex items-center gap-2"><IconGlobe width={15} height={15} className="text-rose" /> {form.server === 'global' ? t('sf.global') : t('sf.china')}</li>
              </ul>
              {form.description && <p className="mt-3 text-sm text-ink-soft">{form.description}</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
