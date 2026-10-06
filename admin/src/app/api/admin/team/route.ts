import type { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { isRole } from '@/lib/auth/roles';
import { HttpError } from '@/lib/auth/session';
import { inviteMember, listMembers } from '@/lib/api/server/team';
import { handle } from '@/lib/api/server/http';

export async function GET() {
  return handle(async () => {
    await requireRole(['owner']);
    return listMembers();
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; role?: string; password?: string };
  return handle(async () => {
    const me = await requireRole(['owner']);
    if (!body.email || !isRole(body.role)) {
      throw new HttpError(400, 'Email and a valid role are required.');
    }
    if (!body.password || body.password.length < 8) {
      throw new HttpError(400, 'A password of at least 8 characters is required.');
    }
    return inviteMember(body.email, body.role, body.password, me.userId);
  });
}
