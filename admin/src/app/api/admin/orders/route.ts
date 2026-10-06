import type { NextRequest } from 'next/server';
import type { CurrencyCode, FulfillmentStatus, PaymentStatus } from '@/types';
import type { OrderQuery } from '@/lib/api/types';
import { listOrders } from '@/lib/api/server/db';
import { handle, intParam, param } from '@/lib/api/server/http';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query: OrderQuery = {
    search: param(url, 'search'),
    serviceId: param(url, 'serviceId') ?? 'all',
    guardianId: param(url, 'guardianId') ?? 'all',
    assignedStaffId: param(url, 'assignedStaffId') ?? 'all',
    currency: (param(url, 'currency') as CurrencyCode | 'all') ?? 'all',
    paymentStatus: (param(url, 'paymentStatus') as PaymentStatus | 'all') ?? 'all',
    fulfillmentStatus: (param(url, 'fulfillmentStatus') as FulfillmentStatus | 'all') ?? 'all',
    dateFrom: param(url, 'dateFrom'),
    dateTo: param(url, 'dateTo'),
    page: intParam(url, 'page') ?? 1,
    perPage: intParam(url, 'perPage') ?? 10,
  };
  return handle(() => listOrders(query));
}
