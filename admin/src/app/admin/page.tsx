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
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';
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

const QUICK_ACTIONS: { href: string; icon: typeof IconPlus; titleKey: TKey; descKey: TKey }[] = [
  { href: '/admin/services/new', icon: IconPlus, titleKey: 'dashboard.addService', descKey: 'dashboard.addServiceDesc' },
  { href: '/admin/vouchers', icon: IconTicket, titleKey: 'dashboard.createVoucher', descKey: 'dashboard.createVoucherDesc' },
  { href: '/admin/orders', icon: IconClipboard, titleKey: 'dashboard.viewOrders', descKey: 'dashboard.viewOrdersDesc' },
];

export default function DashboardPage() {
  const { t } = useI18n();
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
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <>
            <Select
              aria-label={t('dashboard.dateRange')}
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="w-40"
            >
              <option value="30d">{t('dashboard.range30')}</option>
              <option value="7d">{t('dashboard.range7')}</option>
              <option value="90d">{t('dashboard.range90')}</option>
            </Select>
            <Select
              aria-label={t('dashboard.currency')}
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
              label={t('dashboard.totalRevenue')}
              value={formatMoney(data.totalRevenueMinor, currency)}
              deltaPercent={data.revenueDelta.percent}
              deltaLabel={data.revenueDelta.periodLabel}
            />
            <StatCard
              icon={IconCart}
              iconTone="peach"
              label={t('dashboard.paidOrders')}
              value={String(data.paidOrders)}
              deltaPercent={data.paidOrdersDelta.percent}
              deltaLabel={data.paidOrdersDelta.periodLabel}
            />
            <StatCard
              icon={IconClipboard}
              iconTone="lavender"
              label={t('dashboard.activeOrders')}
              value={String(data.activeOrders)}
              deltaPercent={data.activeOrdersDelta.percent}
              deltaLabel={data.activeOrdersDelta.periodLabel}
            />
            <StatCard
              icon={IconRefresh}
              iconTone="blush"
              label={t('dashboard.pendingRefunds')}
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
          title={t('dashboard.revenueTrend')}
          action={<Badge tone="blush">{t('dashboard.revenue')} ({currency})</Badge>}
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
          title={t('dashboard.serviceSales')}
          action={
            <Select
              aria-label={t('dashboard.salesMetric')}
              value={salesMetric}
              onChange={(e) => setSalesMetric(e.target.value as 'units' | 'revenue')}
              className="w-36"
            >
              <option value="units">{t('dashboard.unitsSold')}</option>
              <option value="revenue">{t('dashboard.revenue')}</option>
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
        <CardHeader icon={<IconLightning width={20} height={20} />} title={t('dashboard.quickActions')} />
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
                  <span className="block font-semibold text-plum">{t(action.titleKey)}</span>
                  <span className="block text-xs text-ink-soft">{t(action.descKey)}</span>
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
          title={t('dashboard.recentOrders')}
          action={
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              {t('dashboard.viewAllOrders')} <IconArrowRight width={16} height={16} />
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
                    <th className="pb-3 font-semibold">{t('dashboard.thOrderId')}</th>
                    <th className="pb-3 font-semibold">{t('dashboard.thPlayer')}</th>
                    <th className="pb-3 font-semibold">{t('dashboard.thService')}</th>
                    <th className="pb-3 font-semibold">{t('dashboard.thAmount')} ({currency})</th>
                    <th className="pb-3 font-semibold">{t('dashboard.thStatus')}</th>
                    <th className="pb-3 font-semibold text-right">{t('common.view')}</th>
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
                          {t('common.view')}
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
