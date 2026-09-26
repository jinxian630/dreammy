'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IconCheckCircle, IconInfo, IconX } from './icons';

type ToastTone = 'success' | 'info' | 'error';
interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: ToastTone = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, tone }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-2xl px-4 py-3 text-sm font-medium shadow-lift',
              t.tone === 'success' && 'bg-success text-white',
              t.tone === 'info' && 'bg-plum text-white',
              t.tone === 'error' && 'bg-danger text-white',
            )}
            role="status"
          >
            {t.tone === 'success' ? (
              <IconCheckCircle width={18} height={18} />
            ) : (
              <IconInfo width={18} height={18} />
            )}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => remove(t.id)}
              className="opacity-80 hover:opacity-100"
            >
              <IconX width={16} height={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
