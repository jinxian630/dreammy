import { cn } from '@/lib/cn';
import { formatDateTime } from '@/lib/format';
import { IconCheck } from '@/components/ui/icons';
import type { OrderEvent } from '@/types';

/** Vertical activity timeline for order events. */
export function Timeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="relative space-y-5">
      {events.map((event, i) => {
        const done = event.state === 'done';
        const current = event.state === 'current';
        return (
          <li key={event.id} className="relative flex gap-3">
            {i < events.length - 1 && (
              <span className="absolute left-[11px] top-6 h-full w-px bg-blush-deep/40" aria-hidden />
            )}
            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2',
                done && 'border-primary bg-primary text-white',
                current && 'border-primary bg-white text-primary',
                !done && !current && 'border-blush-deep/60 bg-white text-transparent',
              )}
            >
              {done ? <IconCheck width={13} height={13} /> : <span className="h-2 w-2 rounded-full bg-current" />}
            </span>
            <div className="min-w-0 pb-1">
              <p className="text-sm font-semibold text-plum">{event.label}</p>
              {event.happenedAt && (
                <p className="text-xs text-ink-muted">{formatDateTime(event.happenedAt)}</p>
              )}
              {event.description && <p className="mt-0.5 text-sm text-ink-soft">{event.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
