import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'muted'
  | 'lavender'
  | 'blush'
  | 'primary';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success',
  info: 'bg-info-soft text-info',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
  muted: 'bg-cream-deep text-ink-soft',
  lavender: 'bg-lavender-soft text-plum',
  blush: 'bg-blush-soft text-primary',
  primary: 'bg-primary-soft text-primary',
};

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

export function Badge({ tone = 'muted', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
