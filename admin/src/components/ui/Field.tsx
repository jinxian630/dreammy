import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Wraps a control with a label, optional hint and validation error. */
export function Field({ label, htmlFor, required, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required && <span className="text-primary"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-error">{error}</p>
      ) : hint ? (
        <p className="field-hint">{hint}</p>
      ) : null}
    </div>
  );
}
