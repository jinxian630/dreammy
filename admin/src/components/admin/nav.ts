import type { ComponentType, SVGProps } from 'react';
import {
  IconGrid,
  IconBag,
  IconTicket,
  IconClipboard,
  IconChart,
  IconSettings,
  IconMore,
} from '@/components/ui/icons';

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Match child routes too (e.g. /admin/services/new). */
  matchPrefix?: boolean;
}

/** Full sidebar navigation (desktop). */
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: IconGrid },
  { label: 'Services', href: '/admin/services', icon: IconBag, matchPrefix: true },
  { label: 'Vouchers', href: '/admin/vouchers', icon: IconTicket, matchPrefix: true },
  { label: 'Orders', href: '/admin/orders', icon: IconClipboard, matchPrefix: true },
  { label: 'Reports', href: '/admin/reports', icon: IconChart, matchPrefix: true },
  { label: 'Settings', href: '/admin/settings', icon: IconSettings, matchPrefix: true },
];

/** Primary bottom-nav tabs (mobile). "More" opens the overflow sheet. */
export const BOTTOM_NAV: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: IconGrid },
  { label: 'Services', href: '/admin/services', icon: IconBag, matchPrefix: true },
  { label: 'Orders', href: '/admin/orders', icon: IconClipboard, matchPrefix: true },
  { label: 'Reports', href: '/admin/reports', icon: IconChart, matchPrefix: true },
];

/** Items surfaced in the mobile "More" overflow menu. */
export const MORE_NAV: NavItem[] = [
  { label: 'Vouchers', href: '/admin/vouchers', icon: IconTicket, matchPrefix: true },
  { label: 'Settings', href: '/admin/settings', icon: IconSettings, matchPrefix: true },
];

export const MORE_ITEM: NavItem = { label: 'More', href: '#more', icon: IconMore };

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/admin') return pathname === '/admin';
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}
