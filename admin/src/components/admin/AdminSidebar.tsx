'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { SIDEBAR_NAV, isActive } from './nav';
import { BrandMark } from './BrandMark';

/** Persistent left sidebar (desktop ≥ lg). Hidden on mobile. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-blush-soft bg-cream">
      <div className="px-6 py-6">
        <BrandMark />
      </div>
      <nav className="flex-1 space-y-1 px-4" aria-label="Primary">
        {SIDEBAR_NAV.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-colors',
                active
                  ? 'bg-blush text-primary shadow-soft'
                  : 'text-ink-soft hover:bg-blush-soft hover:text-primary',
              )}
            >
              <Icon width={20} height={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-6">
        <p className="font-script text-xl text-rose leading-tight">
          A little help.
          <br />
          More wonder.
        </p>
        <span className="mt-2 block h-px w-10 bg-rose-soft/60" />
      </div>
    </aside>
  );
}
