import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  const control = (
    <input
      id={id}
      type="checkbox"
      className={cn('h-4 w-4 rounded accent-primary', className)}
      {...props}
    />
  );
  if (!label) return control;
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-ink">
      {control}
      <span>{label}</span>
    </label>
  );
}
