'use client';

import { cn } from '@/lib/cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Pill-style tab switcher (used for voucher status filters). */
export function Tabs<T extends string>({ items, value, onChange, className }: TabsProps<T>) {
  return (
    <div role="tablist" className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors',
              active
                ? 'bg-blush text-primary'
                : 'bg-white text-ink-soft border border-blush-deep/40 hover:bg-blush-soft',
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span className={cn('ml-1', active ? 'text-primary' : 'text-ink-muted')}>
                ({item.count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
