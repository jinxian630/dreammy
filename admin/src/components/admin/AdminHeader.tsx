'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { SIDEBAR_NAV, isActive } from './nav';
import { BrandMark } from './BrandMark';
import { IconBell, IconChevronDown, IconMenu, IconUser, IconX } from '@/components/ui/icons';

/** Sticky top utility bar. Compact + hamburger menu on mobile; account cluster on desktop. */
export function AdminHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="admin-header sticky top-0 z-30 border-b border-blush-soft bg-cream-page/85 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
        {/* Mobile brand */}
        <div className="lg:hidden">
          <BrandMark className="[&>div:first-child]:text-xl" />
        </div>
        {/* Desktop spacer keeps the account cluster right-aligned */}
        <div className="hidden lg:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full border border-blush-deep/40 bg-white p-2 text-ink-soft hover:text-primary"
          >
            <IconBell width={20} height={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-blush-deep/40 bg-white py-1 pl-1 pr-3 sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-lavender text-plum">
              <IconUser width={18} height={18} />
            </span>
            <span className="text-sm font-semibold text-plum">Admin</span>
            <IconChevronDown width={16} height={16} className="text-ink-muted" />
          </div>

          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="rounded-full border border-blush-deep/40 bg-white p-2 text-ink-soft hover:text-primary lg:hidden"
          >
            <IconMenu width={20} height={20} />
          </button>
        </div>
      </div>

      {/* Mobile slide-over menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-plum-deep/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[80%] overflow-y-auto bg-cream p-5 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <BrandMark className="[&>div:first-child]:text-xl" />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="rounded-full p-1.5 text-ink-soft hover:bg-blush-soft"
              >
                <IconX />
              </button>
            </div>
            <nav className="space-y-1" aria-label="Mobile">
              {SIDEBAR_NAV.map((item) => {
                const active = isActive(pathname, item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold',
                      active ? 'bg-blush text-primary' : 'text-ink-soft hover:bg-blush-soft',
                    )}
                  >
                    <Icon width={20} height={20} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
