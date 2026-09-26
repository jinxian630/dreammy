import type { ReportSummary } from '@/types';
import { buildCsv, type CsvColumn } from '@/lib/csv';
import type { ServiceBreakdownRow } from '@/types';

function amount(minor: number): string {
  return (minor / 100).toFixed(2);
}

/** Build the service-sales summary CSV for a single currency's report. */
export function buildReportCsv(report: ReportSummary): string {
  const columns: CsvColumn<ServiceBreakdownRow>[] = [
    { key: 'service', header: 'Service', value: (r) => r.serviceName },
    { key: 'paid', header: 'Paid orders', value: (r) => r.paidOrders },
    { key: 'gross', header: `Gross sales (${report.currency})`, value: (r) => amount(r.grossMinor) },
    { key: 'discounts', header: `Discounts (${report.currency})`, value: (r) => amount(r.discountsMinor) },
    { key: 'refunds', header: `Refunds (${report.currency})`, value: (r) => amount(r.refundsMinor) },
    { key: 'net', header: `Net sales (${report.currency})`, value: (r) => amount(r.netMinor) },
  ];

  const body = buildCsv(report.serviceBreakdown, columns);

  // Totals row + demo notice.
  const totals = [
    'Total',
    report.paidOrders,
    amount(report.grossMinor),
    amount(report.discountsMinor),
    amount(report.refundsMinor),
    amount(report.netMinor),
  ].join(',');

  return (
    `# Dreammy — DEMO DATA report (${report.currency}). Net sales = Gross - Discounts - Refunds (excludes operating costs; not profit).\r\n` +
    body +
    `${totals}\r\n`
  );
}
