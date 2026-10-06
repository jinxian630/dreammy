import type { NextRequest } from 'next/server';
import { HttpError, requireRole } from '@/lib/auth/session';
import { isRole } from '@/lib/auth/roles';
import { deleteMember, updateMemberRole } from '@/lib/api/server/team';
import { handle } from '@/lib/api/server/http';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = (await req.json()) as { role?: string };
  return handle(async () => {
    await requireRole(['owner']);
    if (!isRole(body.role)) throw new HttpError(400, 'A valid role is required.');
    return updateMemberRole(id, body.role);
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handle(async () => {
    await requireRole(['owner']);
    await deleteMember(id);
    return { ok: true };
  });
}
