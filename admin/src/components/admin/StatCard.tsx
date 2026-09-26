import type { ComponentType, SVGProps } from 'react';
import { cn } from '@/lib/cn';
import { formatDelta } from '@/lib/format';

export interface StatCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string;
  deltaPercent?: number;
  deltaLabel?: string;
  iconTone?: 'primary' | 'blush' | 'peach' | 'lavender';
}

const ICON_TONES = {
  primary: 'bg-primary-soft text-primary',
  blush: 'bg-blush text-primary',
  peach: 'bg-peach-soft text-gold-deep',
  lavender: 'bg-lavender text-plum',
};

export function StatCard({
  icon: Icon,
  label,
  value,
  deltaPercent,
  deltaLabel,
  iconTone = 'blush',
}: StatCardProps) {
  const hasDelta = typeof deltaPercent === 'number';
  const positive = (deltaPercent ?? 0) > 0;
  const negative = (deltaPercent ?? 0) < 0;

  return (
    <div className="admin-card p-4 sm:p-5">
      <span
        className={cn(
          'inline-flex h-10 w-10 items-center justify-center rounded-2xl',
          ICON_TONES[iconTone],
        )}
      >
        <Icon width={20} height={20} />
      </span>
      <p className="mt-3 text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-plum">{value}</p>
      {hasDelta && (
        <p className="mt-1 flex items-center gap-1 text-xs">
          <span
            className={cn(
              'font-semibold',
              positive && 'text-success',
              negative && 'text-danger',
              !positive && !negative && 'text-ink-muted',
            )}
          >
            {positive && '↑ '}
            {negative && '↓ '}
            {formatDelta(deltaPercent!)}
          </span>
          {deltaLabel && <span className="text-ink-muted">{deltaLabel}</span>}
        </p>
      )}
    </div>
  );
}
