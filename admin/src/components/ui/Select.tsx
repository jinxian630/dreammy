import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { IconChevronDown } from './icons';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, className, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full h-11 appearance-none rounded-2xl border bg-white pl-3.5 pr-10 text-sm text-ink transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-cream-deep/50',
          invalid ? 'border-danger focus:ring-danger/40' : 'border-blush-deep/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        width={18}
        height={18}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
});
