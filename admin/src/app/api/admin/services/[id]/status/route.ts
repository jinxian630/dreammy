import type { NextRequest } from 'next/server';
import type { ServiceStatus } from '@/types';
import { setServiceStatus } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { status } = (await req.json()) as { status: ServiceStatus };
  return handleWithRole(MUTATE_ROLES, () => setServiceStatus(id, status));
}
