import type { ReactNode } from 'react';
import { DemoBadge } from './DemoBadge';
import { IS_DEMO } from '@/lib/api';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  demo?: boolean;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, demo = IS_DEMO, actions }: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold text-plum">{title}</h1>
          {demo && <DemoBadge />}
        </div>
        {subtitle && <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
