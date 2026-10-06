'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { CurrencyCode, ReportSummary, Service } from '@/types';
import { formatMoney } from '@/lib/money';
import { formatDate } from '@/lib/format';
import { downloadCsv } from '@/lib/csv';
import { buildReportCsv } from '@/lib/exports/reportCsv';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/admin/States';
import { TrendChart } from '@/components/admin/charts/TrendChart';
import { StatusDonut, STATUS_TONE_COLORS } from '@/components/admin/charts/StatusDonut';
import { useToast } from '@/components/ui/Toast';
import { useI18n } from '@/lib/i18n/I18nProvider';
import {
  IconChart,
  IconCoins,
  IconTicket,
  IconRefresh,
  IconDownload,
  IconFile,
  IconInfo,
  IconClipboard,
} from '@/components/ui/icons';

export default function ReportsPage() {
  const { notify } = useToast();
  const { t } = useI18n();
  const [currency, setCurrency] = useState<CurrencyCode>('MYR');
  const [serviceId, setServiceId] = useState('all');
  const [dateFrom, setDateFrom] = useState('2026-09-01');
  const [dateTo, setDateTo] = useState('2026-09-30');
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listServices({ perPage: 999 }).then((r) => setServices(r.data));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getReport(currency).then((r) => {
      if (active) {
        setReport(r);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [currency]);

  const rangeLabel = `${formatDate(dateFrom)} – ${formatDate(dateTo)}`;

  function handleCsv() {
    if (!report) return;
    downloadCsv(`dreammy-report-${currency}-demo.csv`, buildReportCsv(report));
    notify(`${t('reports.reportCsv')} (${currency}) ${t('reports.downloadedDemo')}`);
  }

  function handlePdf() {
    // Browser print-to-PDF: the print stylesheet hides nav chrome and prints
    // the .print-area. Users choose "Save as PDF" in the print dialog.
    window.print();
  }

  return (
    <div>
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleCsv} disabled={!report}>
              <IconDownload width={18} height={18} /> {t('reports.downloadReport')}
            </Button>
            <Button variant="secondary" onClick={handlePdf} disabled={!report}>
              <IconFile width={18} height={18} /> {t('reports.saveAsPdf')}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="no-print mb-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="block min-w-0 sm:col-span-2 lg:col-span-2">
            <span className="field-label">{t('reports.dateRange')}</span>
            <div className="flex items-center gap-2 min-w-0">
              <Input type="date" className="min-w-0 flex-1" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label={t('orders.dateFrom')} />
              <span className="shrink-0 text-ink-muted">–</span>
              <Input type="date" className="min-w-0 flex-1" value={dateTo} onChange={(e) => setDateTo(e.target.value)} aria-label={t('orders.dateTo')} />
            </div>
          </label>
          <label className="block min-w-0">
            <span className="field-label">{t('reports.currency')}</span>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as CurrencyCode)}>
              <option value="MYR">MYR (RM)</option>
              <option value="CNY">CNY (¥)</option>
            </Select>
          </label>
          <label className="block min-w-0">
            <span className="field-label">{t('reports.service')}</span>
            <Select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
              <option value="all">{t('common.allServices')}</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </label>
          <div className="flex items-end">
            <Button block onClick={() => notify(t('reports.filtersApplied'))}>
              {t('reports.applyFilters')}
            </Button>
          </div>
        </div>
        <p className="field-hint mt-2">
          {t('reports.separatePrefix')} <strong>{currency}</strong> {t('reports.separateFor')} {rangeLabel}.
        </p>
      </Card>

      {/* Printable region */}
      <div className="print-area space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || !report ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)
          ) : (
            <>
              <StatCard icon={IconChart} iconTone="blush" label={t('reports.grossSales')} value={formatMoney(report.grossMinor, currency)} />
              <StatCard icon={IconTicket} iconTone="peach" label={t('reports.discounts')} value={formatMoney(report.discountsMinor, currency)} />
              <StatCard icon={IconRefresh} iconTone="lavender" label={t('reports.refunds')} value={formatMoney(report.refundsMinor, currency)} />
              <div className="admin-card p-4 sm:p-5">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blush text-primary">
                  <IconCoins width={20} height={20} />
                </span>
                <p className="mt-3 text-sm font-medium text-ink-soft">{t('reports.netSales')}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-plum">{formatMoney(report.netMinor, currency)}</p>
                <p className="mt-1 text-xs text-ink-muted">{t('reports.netFormula')}</p>
              </div>
            </>
          )}
        </div>

        {loading || !report ? (
          <Skeleton className="h-72 w-full" />
        ) : (
          <>
            {/* Trend + service breakdown */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader icon={<IconChart width={20} height={20} />} title={t('reports.dailySalesTrend')} action={<Badge tone="blush">{rangeLabel}</Badge>} />
                <p className="mt-1 text-xs text-ink-muted">{t('reports.dailySales')} ({currency})</p>
                <div className="mt-3">
                  <TrendChart data={report.salesTrend} format={(v) => formatMoney(v, currency, { decimals: false })} height={240} />
                </div>
              </Card>

              <Card>
                <CardHeader icon={<IconChart width={20} height={20} />} title={t('reports.salesByService')} />
                <p className="mt-1 text-xs text-ink-muted">{t('reports.grossSales')} ({currency})</p>
                <ServiceBars report={report} currency={currency} />
              </Card>
            </div>

            {/* Status donut + summary */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader icon={<IconClipboard width={20} height={20} />} title={t('reports.orderStatusBreakdown')} />
                <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
                  <StatusDonut slices={report.statusDistribution} centerValue={String(report.totalOrders)} centerLabel={t('reports.totalOrders')} />
                  <ul className="flex-1 space-y-2">
                    {report.statusDistribution.map((s) => (
                      <li key={s.key} className="flex items-center gap-2 text-sm">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_TONE_COLORS[s.tone] }} />
                        <span className="text-ink-soft">{s.label}</span>
                        <span className="ml-auto font-semibold text-plum">
                          {s.count} ({s.percent}%)
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              <Card>
                <CardHeader icon={<IconFile width={20} height={20} />} title={t('reports.summary')} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MiniStat label={t('reports.totalOrders')} value={String(report.totalOrders)} />
                  <MiniStat label={t('reports.paidOrders')} value={String(report.paidOrders)} />
                  <MiniStat label={t('reports.conversionRate')} value={`${report.conversionRate}%`} />
                  <MiniStat label={t('reports.avgOrderValue')} value={formatMoney(report.avgOrderValueMinor, currency)} />
                </div>
              </Card>
            </div>

            {/* Service sales summary table */}
            <Card>
              <CardHeader icon={<IconFile width={20} height={20} />} title={t('reports.serviceSalesSummary')} />
              <div className="mt-4">
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blush-soft text-left text-xs uppercase tracking-wide text-ink-muted">
                        <th className="pb-3 font-semibold">{t('reports.service')}</th>
                        <th className="pb-3 font-semibold text-right">{t('reports.thPaidOrders')}</th>
                        <th className="pb-3 font-semibold text-right">{t('reports.thGross')} ({currency})</th>
                        <th className="pb-3 font-semibold text-right">{t('reports.thDiscounts')} ({currency})</th>
                        <th className="pb-3 font-semibold text-right">{t('reports.thRefunds')} ({currency})</th>
                        <th className="pb-3 font-semibold text-right">{t('reports.thNet')} ({currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blush-soft">
                      {report.serviceBreakdown.map((r) => (
                        <tr key={r.serviceId}>
                          <td className="py-3 font-medium text-plum">{r.serviceName}</td>
                          <td className="py-3 text-right text-ink">{r.paidOrders}</td>
                          <td className="py-3 text-right text-ink">{formatMoney(r.grossMinor, currency, { withSymbol: false })}</td>
                          <td className="py-3 text-right text-ink">{formatMoney(r.discountsMinor, currency, { withSymbol: false })}</td>
                          <td className="py-3 text-right text-ink">{formatMoney(r.refundsMinor, currency, { withSymbol: false })}</td>
                          <td className="py-3 text-right font-semibold text-plum">{formatMoney(r.netMinor, currency, { withSymbol: false })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-blush-deep/40 font-semibold text-plum">
                        <td className="py-3">{t('common.total')}</td>
                        <td className="py-3 text-right">{report.paidOrders}</td>
                        <td className="py-3 text-right">{formatMoney(report.grossMinor, currency, { withSymbol: false })}</td>
                        <td className="py-3 text-right">{formatMoney(report.discountsMinor, currency, { withSymbol: false })}</td>
                        <td className="py-3 text-right">{formatMoney(report.refundsMinor, currency, { withSymbol: false })}</td>
                        <td className="py-3 text-right">{formatMoney(report.netMinor, currency, { withSymbol: false })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile cards */}
                <ul className="space-y-3 lg:hidden">
                  {report.serviceBreakdown.map((r) => (
                    <li key={r.serviceId} className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-plum">{r.serviceName}</p>
                        <span className="font-semibold text-primary">{formatMoney(r.netMinor, currency)}</span>
                      </div>
                      <p className="mt-1 text-xs text-ink-soft">
                        {r.paidOrders} {t('reports.paidOrdersLower')} · {t('reports.thGross')} {formatMoney(r.grossMinor, currency)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {t('reports.thDiscounts')} {formatMoney(r.discountsMinor, currency)} · {t('reports.thRefunds')} {formatMoney(r.refundsMinor, currency)}
                      </p>
                    </li>
                  ))}
                  <li className="rounded-2xl bg-blush-soft p-3 font-semibold text-plum">
                    <div className="flex items-center justify-between">
                      <span>{t('reports.totalNet')} ({currency})</span>
                      <span>{formatMoney(report.netMinor, currency)}</span>
                    </div>
                  </li>
                </ul>
              </div>
            </Card>

            {/* Report information */}
            <Card>
              <CardHeader icon={<IconInfo width={20} height={20} />} title={t('reports.reportInformation')} />
              <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <InfoRow label={t('reports.dateRange')} value={rangeLabel} />
                <InfoRow label={t('reports.currency')} value={`${currency} (${currency === 'MYR' ? t('reports.myr') : t('reports.cny')})`} />
                <InfoRow label={t('reports.service')} value={serviceId === 'all' ? t('common.allServices') : services.find((s) => s.id === serviceId)?.name ?? '—'} />
                <InfoRow label={t('reports.generatedBy')} value={t('reports.adminDemo')} />
                <InfoRow label={t('reports.dataLabel')} value={t('reports.dataDemo')} />
              </dl>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function ServiceBars({ report, currency }: { report: ReportSummary; currency: CurrencyCode }) {
  const max = useMemo(
    () => Math.max(1, ...report.serviceBreakdown.map((r) => r.grossMinor)),
    [report],
  );
  const COLORS = ['#C43C6E', '#E86A9A', '#C9A6DE', '#F0A6BD', '#B79BD6'];
  return (
    <ul className="mt-4 space-y-3.5">
      {report.serviceBreakdown.map((r, i) => (
        <li key={r.serviceId}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-plum">{r.serviceName}</span>
            <span className="font-semibold text-ink">{formatMoney(r.grossMinor, currency)}</span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-blush-soft">
            <div
              className="h-full rounded-full"
              style={{ width: `${(r.grossMinor / max) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-blush-soft bg-surface-soft p-3">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-plum">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-blush-soft/60 py-1.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
