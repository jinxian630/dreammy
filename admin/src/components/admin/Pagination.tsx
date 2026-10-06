'use client';

import { cn } from '@/lib/cn';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';
import { useI18n } from '@/lib/i18n/I18nProvider';

export interface PaginationProps {
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
}

export function Pagination({
  page,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 20, 50],
}: PaginationProps) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-soft">
        {t('pagination.showing')} {total === 0 ? 0 : (page - 1) * perPage + 1}
        {'–'}
        {Math.min(page * perPage, total)} {t('pagination.of')} {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={t('pagination.prev')}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-full border border-blush-deep/40 bg-white p-2 text-ink-soft disabled:opacity-40 hover:enabled:text-primary"
        >
          <IconChevronLeft width={16} height={16} />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 min-w-9 rounded-full px-3 text-sm font-semibold',
              p === page
                ? 'bg-blush text-primary'
                : 'border border-blush-deep/40 bg-white text-ink-soft hover:text-primary',
            )}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          aria-label={t('pagination.next')}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-full border border-blush-deep/40 bg-white p-2 text-ink-soft disabled:opacity-40 hover:enabled:text-primary"
        >
          <IconChevronRight width={16} height={16} />
        </button>
        {onPerPageChange && (
          <select
            aria-label={t('pagination.rowsPerPage')}
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="ml-1 h-9 rounded-full border border-blush-deep/40 bg-white px-3 text-sm text-ink-soft"
          >
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n} {t('pagination.perPage')}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
