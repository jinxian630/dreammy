import type { ComponentType, SVGProps } from 'react';
import {
  IconGrid,
  IconBag,
  IconTicket,
  IconClipboard,
  IconChart,
  IconSettings,
  IconMore,
  IconUsers,
} from '@/components/ui/icons';
import type { TKey } from '@/lib/i18n/dictionary';

export interface NavItem {
  /** Default English label (fallback); UI renders the translation of `labelKey`. */
  label: string;
  labelKey: TKey;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Match child routes too (e.g. /admin/services/new). */
  matchPrefix?: boolean;
}

/** Full sidebar navigation (desktop). */
export const SIDEBAR_NAV: NavItem[] = [
  { label: 'Overview', labelKey: 'nav.overview', href: '/admin', icon: IconGrid },
  { label: 'Services', labelKey: 'nav.services', href: '/admin/services', icon: IconBag, matchPrefix: true },
  { label: 'Vouchers', labelKey: 'nav.vouchers', href: '/admin/vouchers', icon: IconTicket, matchPrefix: true },
  { label: 'Orders', labelKey: 'nav.orders', href: '/admin/orders', icon: IconClipboard, matchPrefix: true },
  { label: 'Order Status', labelKey: 'nav.orderStatus', href: '/admin/order-status', icon: IconUsers, matchPrefix: true },
  { label: 'Reports', labelKey: 'nav.reports', href: '/admin/reports', icon: IconChart, matchPrefix: true },
  { label: 'Settings', labelKey: 'nav.settings', href: '/admin/settings', icon: IconSettings, matchPrefix: true },
];

/** Primary bottom-nav tabs (mobile). "More" opens the overflow sheet. */
export const BOTTOM_NAV: NavItem[] = [
  { label: 'Overview', labelKey: 'nav.overview', href: '/admin', icon: IconGrid },
  { label: 'Services', labelKey: 'nav.services', href: '/admin/services', icon: IconBag, matchPrefix: true },
  { label: 'Orders', labelKey: 'nav.orders', href: '/admin/orders', icon: IconClipboard, matchPrefix: true },
  { label: 'Status', labelKey: 'nav.status', href: '/admin/order-status', icon: IconUsers, matchPrefix: true },
  { label: 'Reports', labelKey: 'nav.reports', href: '/admin/reports', icon: IconChart, matchPrefix: true },
];

/** Items surfaced in the mobile "More" overflow menu. */
export const MORE_NAV: NavItem[] = [
  { label: 'Vouchers', labelKey: 'nav.vouchers', href: '/admin/vouchers', icon: IconTicket, matchPrefix: true },
  { label: 'Settings', labelKey: 'nav.settings', href: '/admin/settings', icon: IconSettings, matchPrefix: true },
];

export const MORE_ITEM: NavItem = { label: 'More', labelKey: 'nav.more', href: '#more', icon: IconMore };

export function isActive(pathname: string, item: NavItem): boolean {
  if (item.href === '/admin') return pathname === '/admin';
  return item.matchPrefix ? pathname.startsWith(item.href) : pathname === item.href;
}
