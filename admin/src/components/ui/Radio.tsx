import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface RadioCardProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: ReactNode;
  description?: ReactNode;
  tone?: 'default' | 'success';
  compact?: boolean;
}

/** Radio rendered as a selectable card (used across the service form). */
export function RadioCard({
  name,
  value,
  checked,
  onChange,
  title,
  description,
  tone = 'default',
  compact,
}: RadioCardProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors',
        compact && 'p-2.5',
        checked
          ? tone === 'success'
            ? 'border-success bg-success-soft'
            : 'border-primary bg-primary-soft/60'
          : 'border-blush-deep/40 bg-white hover:border-primary/40',
      )}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="mt-0.5 h-4 w-4 accent-primary"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-plum">{title}</span>
        {description && <span className="mt-0.5 block text-xs text-ink-muted">{description}</span>}
      </span>
    </label>
  );
}

export interface RadioPillProps {
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: ReactNode;
}

/** Inline radio pill (e.g. duration / target choices). */
export function RadioPill({ name, value, checked, onChange, children }: RadioPillProps) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 accent-primary"
      />
      {children}
    </label>
  );
}
