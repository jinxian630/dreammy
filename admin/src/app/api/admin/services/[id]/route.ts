import type { NextRequest } from 'next/server';
import type { ServiceInput } from '@/types';
import { getService, updateService } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES, VIEW_ALL_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handleWithRole(VIEW_ALL_ROLES, () => getService(id));
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const input = (await req.json()) as ServiceInput;
  return handleWithRole(MUTATE_ROLES, () => updateService(id, input));
}
