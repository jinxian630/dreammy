import type { NextRequest } from 'next/server';
import type { VoucherInput } from '@/types';
import type { VoucherQuery } from '@/lib/api/types';
import { createVoucher, listVouchers } from '@/lib/api/server/db';
import { handleWithRole, param } from '@/lib/api/server/http';
import { MUTATE_ROLES, VIEW_ALL_ROLES } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query: VoucherQuery = {
    search: param(url, 'search'),
    status: (param(url, 'status') as VoucherQuery['status']) ?? 'all',
  };
  return handleWithRole(VIEW_ALL_ROLES, () => listVouchers(query));
}

export async function POST(req: NextRequest) {
  const input = (await req.json()) as VoucherInput;
  return handleWithRole(MUTATE_ROLES, () => createVoucher(input));
}
