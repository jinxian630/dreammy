'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { BOTTOM_NAV, MORE_NAV, MORE_ITEM, isActive } from './nav';

/** Fixed bottom navigation (mobile only). Matches the template tab bar. */
export function AdminBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActive = MORE_NAV.some((item) => isActive(pathname, item));
  const MoreIcon = MORE_ITEM.icon;

  return (
    <>
      <nav
        className="admin-bottom-nav fixed inset-x-0 bottom-0 z-30 border-t border-blush-soft bg-cream-page/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'var(--safe-bottom)' }}
        aria-label="Bottom navigation"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {BOTTOM_NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold',
                  active ? 'text-primary' : 'text-ink-muted',
                )}
              >
                <Icon width={22} height={22} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="menu"
            aria-expanded={moreOpen}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold',
              moreActive ? 'text-primary' : 'text-ink-muted',
            )}
          >
            <MoreIcon width={22} height={22} />
            More
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-plum-deep/40" onClick={() => setMoreOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-4 pb-8 shadow-lift">
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-blush-deep/50" />
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              More
            </p>
            {MORE_NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-ink hover:bg-blush-soft"
                >
                  <Icon width={20} height={20} className="text-primary" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
