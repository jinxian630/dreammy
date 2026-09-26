import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

const fieldBase =
  'w-full h-11 rounded-2xl border bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-cream-deep/50';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, leftIcon, rightSlot, className, ...props },
  ref,
) {
  if (leftIcon || rightSlot) {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-ink-muted">{leftIcon}</span>
        )}
        <input
          ref={ref}
          className={cn(
            fieldBase,
            leftIcon ? 'pl-10' : '',
            rightSlot ? 'pr-24' : '',
            invalid ? 'border-danger focus:ring-danger/40' : 'border-blush-deep/50',
            className,
          )}
          {...props}
        />
        {rightSlot && <span className="absolute right-1.5">{rightSlot}</span>}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        fieldBase,
        invalid ? 'border-danger focus:ring-danger/40' : 'border-blush-deep/50',
        className,
      )}
      {...props}
    />
  );
});
