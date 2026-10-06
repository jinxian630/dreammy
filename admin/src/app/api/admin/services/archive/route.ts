import type { NextRequest } from 'next/server';
import { archiveServices } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: string[] };
  return handleWithRole(MUTATE_ROLES, async () => {
    await archiveServices(ids);
    return { ok: true };
  });
}
