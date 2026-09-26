import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('admin-card p-4 sm:p-5', className)}>{children}</section>;
}

export interface CardHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ icon, title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-3', className)}>
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <span className="mt-0.5 text-primary">{icon}</span>}
        <div className="min-w-0">
          <h2 className="font-display text-lg text-plum leading-tight">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
