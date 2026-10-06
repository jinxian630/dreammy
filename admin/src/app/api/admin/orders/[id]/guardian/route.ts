import type { NextRequest } from 'next/server';
import { assignGuardian } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { guardianId } = (await req.json()) as { guardianId: string };
  return handleWithRole(MUTATE_ROLES, () => assignGuardian(id, guardianId));
}
