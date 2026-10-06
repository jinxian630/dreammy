import type { NextRequest } from 'next/server';
import { requestRefund } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handleWithRole(MUTATE_ROLES, () => requestRefund(id));
}
