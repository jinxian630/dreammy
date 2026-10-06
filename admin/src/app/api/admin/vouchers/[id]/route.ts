import type { NextRequest } from 'next/server';
import type { VoucherInput } from '@/types';
import { deleteVoucher, getVoucher, updateVoucher } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES, VIEW_ALL_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handleWithRole(VIEW_ALL_ROLES, () => getVoucher(id));
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const input = (await req.json()) as VoucherInput;
  return handleWithRole(MUTATE_ROLES, () => updateVoucher(id, input));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handleWithRole(MUTATE_ROLES, async () => {
    await deleteVoucher(id);
    return { ok: true };
  });
}
