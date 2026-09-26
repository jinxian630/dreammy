import { IconInfo } from '@/components/ui/icons';
import { cn } from '@/lib/cn';

/** "Demo data" pill shown on every page — the app never claims real data. */
export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-info-soft px-2.5 py-1 text-xs font-semibold text-info',
        className,
      )}
      title="All figures on this screen are demonstration data — no real orders, payments or uploads."
    >
      <IconInfo width={14} height={14} />
      Demo data
    </span>
  );
}
