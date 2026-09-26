'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconX } from './icons';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  /** 'center' modal (default) or 'bottom' sheet on mobile. */
  size?: 'sm' | 'md' | 'lg';
  labelledBy?: string;
}

const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' } as const;

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-plum-deep/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-t-3xl bg-surface shadow-lift outline-none sm:rounded-3xl',
          'max-h-[92vh] overflow-y-auto',
          SIZES[size],
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 border-b border-blush-soft p-5">
            <div>
              {title && <h2 className="font-display text-xl text-plum">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-full p-1.5 text-ink-soft hover:bg-blush-soft"
            >
              <IconX />
            </button>
          </div>
        )}
        {children && <div className="p-5">{children}</div>}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-blush-soft p-5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
