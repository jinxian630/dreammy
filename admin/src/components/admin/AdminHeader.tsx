'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { SIDEBAR_NAV, isActive } from './nav';
import { BrandMark } from './BrandMark';
import { useCurrentMember } from '@/lib/auth/useCurrentMember';
import { supabaseBrowser } from '@/lib/supabase/browser';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';
import { LanguageSwitcher } from './LanguageSwitcher';
import { IconBell, IconChevronDown, IconMenu, IconUser, IconX } from '@/components/ui/icons';

async function signOut() {
  await supabaseBrowser().auth.signOut();
  window.location.assign('/login');
}

/** Sticky top utility bar. Compact + hamburger menu on mobile; account cluster on desktop. */
export function AdminHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { member } = useCurrentMember();
  const { t } = useI18n();
  const displayName = member?.email ?? 'Account';
  const roleLabel = member ? t(`role.${member.role}` as TKey) : '';

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
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <button
            type="button"
            aria-label={t('header.notifications')}
            className="relative rounded-full border border-blush-deep/40 bg-white p-2 text-ink-soft hover:text-primary"
          >
            <IconBell width={20} height={20} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </button>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              aria-label={t('header.accountMenu')}
              className="flex max-w-[220px] items-center gap-2 rounded-full border border-blush-deep/40 bg-white py-1 pl-1 pr-3"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lavender text-plum">
                <IconUser width={18} height={18} />
              </span>
              <span className="truncate text-sm font-semibold text-plum">{displayName}</span>
              <IconChevronDown width={16} height={16} className="flex-shrink-0 text-ink-muted" />
            </button>
            {accountOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-60 rounded-2xl border border-blush-soft bg-white p-3 shadow-lift">
                  <p className="truncate text-sm font-semibold text-plum">{member?.email ?? '—'}</p>
                  {member && (
                    <p className="mt-0.5 text-xs text-ink-soft">
                      {t('header.roleLabel')}: {roleLabel}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={signOut}
                    className="mt-3 w-full rounded-xl bg-blush-soft py-2 text-sm font-semibold text-primary hover:bg-blush"
                  >
                    {t('header.signOut')}
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label={t('header.openMenu')}
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
                aria-label={t('header.closeMenu')}
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
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-blush pt-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="text-xs font-semibold text-ink-soft">{t('lang.label')}</span>
                <LanguageSwitcher />
              </div>
              {member && (
                <p className="mb-2 truncate px-1 text-xs text-ink-soft">
                  {member.email} · {roleLabel}
                </p>
              )}
              <button
                type="button"
                onClick={signOut}
                className="w-full rounded-2xl bg-blush-soft py-2.5 text-sm font-semibold text-primary hover:bg-blush"
              >
                {t('header.signOut')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
