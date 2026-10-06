import type { NextRequest } from 'next/server';
import type { CurrencyCode } from '@/types';
import { getReport } from '@/lib/api/server/db';
import { handleWithRole, param } from '@/lib/api/server/http';
import { VIEW_ALL_ROLES } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const currency = (param(new URL(req.url), 'currency') as CurrencyCode) ?? 'MYR';
  return handleWithRole(VIEW_ALL_ROLES, () => getReport(currency));
}
