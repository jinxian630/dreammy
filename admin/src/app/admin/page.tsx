'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import type { CurrencyCode, DashboardMetrics } from '@/types';
import { formatMoney } from '@/lib/money';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/admin/States';
import { TrendChart } from '@/components/admin/charts/TrendChart';
import { SalesBarChart } from '@/components/admin/charts/SalesBarChart';
import {
  IconCoins,
  IconCart,
  IconClipboard,
  IconRefresh,
  IconChart,
  IconLightning,
  IconPlus,
  IconTicket,
  IconArrowRight,
  IconChevronRight,
  IconFile,
} from '@/components/ui/icons';

const QUICK_ACTIONS = [
  { href: '/admin/services/new', icon: IconPlus, title: 'Add service', desc: 'Create a new game service' },
  { href: '/admin/vouchers', icon: IconTicket, title: 'Create voucher', desc: 'Set up a promotion' },
  { href: '/admin/orders', icon: IconClipboard, title: 'View orders', desc: 'Manage service orders' },
];

export default function DashboardPage() {
  const [currency, setCurrency] = useState<CurrencyCode>('MYR');
  const [range, setRange] = useState('30d');
  const [salesMetric, setSalesMetric] = useState<'units' | 'revenue'>('units');
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getDashboard(currency).then((d) => {
      if (active) {
        setData(d);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [currency]);

  return (
    <div>
      <PageHeader
        title="Overview"
        subtitle="Here's what's happening with your Dreammy services."
        actions={
          <>
            <Select
              aria-label="Date range"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-40"
            >
              <option value="30d">Last 30 days</option>
              <option value="7d">Last 7 days</option>
              <option value="90d">Last 90 days</option>
            </Select>
            <Select
              aria-label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-28"
            >
              <option value="MYR">MYR (RM)</option>
              <option value="CNY">CNY (¥)</option>
            </Select>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
        ) : (
          <>
            <StatCard
              icon={IconCoins}
              iconTone="blush"
              label="Total revenue"
              value={formatMoney(data.totalRevenueMinor, currency)}
              deltaPercent={data.revenueDelta.percent}
              deltaLabel={data.revenueDelta.periodLabel}
            />
            <StatCard
              icon={IconCart}
              iconTone="peach"
              label="Paid orders"
              value={String(data.paidOrders)}
              deltaPercent={data.paidOrdersDelta.percent}
              deltaLabel={data.paidOrdersDelta.periodLabel}
            />
            <StatCard
              icon={IconClipboard}
              iconTone="lavender"
              label="Active orders"
              value={String(data.activeOrders)}
              deltaPercent={data.activeOrdersDelta.percent}
              deltaLabel={data.activeOrdersDelta.periodLabel}
            />
            <StatCard
              icon={IconRefresh}
              iconTone="blush"
              label="Pending refunds"
              value={String(data.pendingRefunds)}
              deltaPercent={data.pendingRefundsDelta.percent}
              deltaLabel={data.pendingRefundsDelta.periodLabel}
            />
          </>
        )}
      </div>

      {/* Revenue trend */}
      <Card className="mt-5">
        <CardHeader
          icon={<IconChart width={20} height={20} />}
          title="Revenue Trend"
          action={<Badge tone="blush">Revenue ({currency})</Badge>}
        />
        <div className="mt-4">
          {loading || !data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <TrendChart
              data={data.revenueTrend}
              format={(v) => formatMoney(v, currency, { decimals: false })}
            />
          )}
        </div>
      </Card>

      {/* Service sales */}
      <Card className="mt-5">
        <CardHeader
          icon={<IconChart width={20} height={20} />}
          title="Service Sales"
          action={
            <Select
              aria-label="Service sales metric"
              value={salesMetric}
              onChange={(e) => setSalesMetric(e.target.value as 'units' | 'revenue')}
              className="w-36"
            >
              <option value="units">Units sold</option>
              <option value="revenue">Revenue</option>
            </Select>
          }
        />
        <div className="mt-4">
          {loading || !data ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <SalesBarChart
              data={data.serviceSales.map((s) => ({
                label: s.label,
                value: salesMetric === 'units' ? s.unitsSold : s.revenueMinor,
              }))}
              format={
                salesMetric === 'units'
                  ? (v) => String(v)
                  : (v) => formatMoney(v, currency, { decimals: false })
              }
            />
          )}
        </div>
      </Card>

      {/* Quick actions */}
      <Card className="mt-5">
        <CardHeader icon={<IconLightning width={20} height={20} />} title="Quick Actions" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-2xl border border-blush-soft bg-surface-soft p-4 transition-colors hover:border-primary/40"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Icon width={20} height={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-plum">{action.title}</span>
                  <span className="block text-xs text-ink-soft">{action.desc}</span>
                </span>
                <IconChevronRight width={18} height={18} className="text-ink-muted" />
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Recent orders */}
      <Card className="mt-5">
        <CardHeader
          icon={<IconFile width={20} height={20} />}
          title="Recent Orders"
          action={
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              View all orders <IconArrowRight width={16} height={16} />
            </Link>
          }
        />
        <div className="mt-4">
          {loading || !data ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <>
              {/* Desktop table */}
              <table className="hidden w-full text-sm sm:table">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="pb-3 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Player</th>
                    <th className="pb-3 font-semibold">Service</th>
                    <th className="pb-3 font-semibold">Amount ({currency})</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blush-soft">
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-3 font-semibold text-plum">{o.code}</td>
                      <td className="py-3 text-ink">{o.player}</td>
                      <td className="py-3 text-ink-soft">{o.service}</td>
                      <td className="py-3 text-ink">{formatMoney(o.amountMinor, o.currency, { decimals: false })}</td>
                      <td className="py-3">
                        <Badge tone={o.statusTone}>{o.status}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Link href={`/admin/orders/${o.id}`} className="text-sm font-semibold text-primary hover:underline">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <ul className="space-y-2.5 sm:hidden">
                {data.recentOrders.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-blush-soft bg-surface-soft p-3"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold text-plum">{o.code}</span>
                        <span className="block truncate text-xs text-ink-soft">
                          {o.player} · {o.service}
                        </span>
                        <span className="mt-0.5 block text-sm font-semibold text-ink">
                          {formatMoney(o.amountMinor, o.currency, { decimals: false })}
                        </span>
                      </span>
                      <Badge tone={o.statusTone}>{o.status}</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
