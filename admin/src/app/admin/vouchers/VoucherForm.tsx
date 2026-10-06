'use client';

import { useEffect, useState } from 'react';
import type { Service, VoucherInput } from '@/types';
import type { VoucherWithStatus } from '@/lib/api';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { uploadImage } from '@/lib/upload';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { IconTicket } from '@/components/ui/icons';

interface FormState {
  name: string;
  description: string;
  serviceId: string;
  pointsCost: string;
  imageKey: string | null;
  imagePreview: string | null;
  imageFile: File | null;
  available: boolean;
}

function blankState(): FormState {
  return {
    name: '',
    description: '',
    serviceId: '',
    pointsCost: '',
    imageKey: null,
    imagePreview: null,
    imageFile: null,
    available: true,
  };
}

function toFormState(v: VoucherWithStatus): FormState {
  return {
    name: v.name,
    description: v.description,
    serviceId: v.serviceId ?? '',
    pointsCost: String(v.pointsCost),
    imageKey: v.imageKey,
    imagePreview: null,
    imageFile: null,
    available: v.available,
  };
}

export interface VoucherFormProps {
  editing: VoucherWithStatus | null;
  services: Service[];
  onSubmit: (input: VoucherInput) => Promise<void>;
  onCancelEdit: () => void;
}

export function VoucherForm({ editing, services, onSubmit, onCancelEdit }: VoucherFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(() => (editing ? toFormState(editing) : blankState()));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(editing ? toFormState(editing) : blankState());
    setErrors({});
  }, [editing]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = t('vf.errNameReq');
    if (!form.serviceId) next.serviceId = t('vf.errServiceReq');
    const pts = Number(form.pointsCost);
    if (!form.pointsCost.trim() || !Number.isFinite(pts) || pts < 1) {
      next.pointsCost = t('vf.errPoints');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    let imageKey = form.imageKey;
    try {
      if (form.imageFile) imageKey = await uploadImage(form.imageFile, 'service-images');
    } catch {
      setErrors({ image: t('vf.imgUploadFailed') });
      setSaving(false);
      return;
    }

    const input: VoucherInput = {
      name: form.name.trim(),
      description: form.description.trim(),
      serviceId: form.serviceId || null,
      pointsCost: Number(form.pointsCost),
      imageKey,
      available: form.available,
    };
    await onSubmit(input);
    setSaving(false);
    if (!editing) setForm(blankState());
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
          <IconTicket width={18} height={18} />
        </span>
        <div>
          <h2 className="font-display text-lg text-plum">
            {editing ? t('vf.editTitle') : t('vf.createTitle')}
          </h2>
          <p className="text-sm text-ink-soft">
            {editing ? `${t('vf.editingPrefix')} ${editing.name}.` : t('vf.createSub')}
          </p>
        </div>
      </div>

      <Field label={t('vf.rewardName')} required htmlFor="v-name" hint={t('vf.rewardNameHint')} error={errors.name}>
        <Input id="v-name" value={form.name} invalid={!!errors.name} onChange={(e) => set('name', e.target.value)} placeholder={t('vf.rewardNamePh')} />
      </Field>

      <Field label={t('vf.description')} htmlFor="v-desc" hint={t('vf.descriptionHint')}>
        <Textarea id="v-desc" value={form.description} maxLength={300} rows={3} onChange={(e) => set('description', e.target.value)} placeholder={t('vf.descriptionPh')} />
      </Field>

      <Field label={t('vf.freeService')} required htmlFor="v-service" hint={t('vf.freeServiceHint')} error={errors.serviceId}>
        <Select id="v-service" value={form.serviceId} invalid={!!errors.serviceId} onChange={(e) => set('serviceId', e.target.value)}>
          <option value="">{t('vf.selectService')}</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field label={t('vf.pointsCost')} required htmlFor="v-points" hint={t('vf.pointsCostHint')} error={errors.pointsCost}>
        <Input id="v-points" inputMode="numeric" value={form.pointsCost} invalid={!!errors.pointsCost} onChange={(e) => set('pointsCost', e.target.value)} placeholder="1000" rightSlot={<span className="pr-3 text-sm text-ink-muted">{t('vc.pts')}</span>} />
      </Field>

      <Field label={t('vf.image')} htmlFor="v-image" hint={t('vf.imageHint')} error={errors.image}>
        <ImageUpload
          ratio="16 / 10"
          value={form.imagePreview ?? form.imageKey}
          onChange={(url, file) => {
            set('imagePreview', url);
            set('imageFile', file);
          }}
        />
      </Field>

      <div className="flex items-center justify-between rounded-2xl border border-blush-soft bg-surface-soft p-3">
        <div>
          <p className="text-sm font-semibold text-plum">{t('vf.available')}</p>
          <p className="text-xs text-ink-soft">{t('vf.availableDesc')}</p>
        </div>
        <Toggle checked={form.available} onChange={(v) => set('available', v)} label={t('vf.available')} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {editing && (
          <Button type="button" variant="ghost" onClick={onCancelEdit} disabled={saving}>
            {t('vf.cancel')}
          </Button>
        )}
        <Button type="submit" block disabled={saving}>
          <IconTicket width={18} height={18} /> {saving ? t('common.saving') : editing ? t('vf.updateVoucher') : t('vf.saveVoucher')}
        </Button>
      </div>
    </form>
  );
}
