import { cn } from '@/lib/cn';

/** The "Dreammy ADMIN" wordmark. Text is real HTML — no image required. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <div className={cn('leading-none', className)}>
      <div className="font-display text-2xl font-semibold text-primary">Dreammy</div>
      <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.35em] text-rose">
        Admin
      </div>
    </div>
  );
}
