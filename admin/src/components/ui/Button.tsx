import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-soft disabled:bg-primary/50',
  secondary:
    'bg-blush text-primary hover:bg-blush-deep/70 disabled:opacity-60',
  outline:
    'border border-primary/40 text-primary bg-white hover:bg-primary-soft disabled:opacity-60',
  ghost: 'text-ink hover:bg-blush-soft disabled:opacity-60',
  danger:
    'border border-danger/40 text-danger bg-white hover:bg-danger-soft disabled:opacity-60',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-sm gap-2',
  lg: 'h-12 px-5 text-base gap-2',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', block, className, type, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? 'button'}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-semibold transition-colors disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
