import type { NextRequest } from 'next/server';
import type { ScreenshotSlot } from '@/lib/api/types';
import { setScreenshot } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { slot, url } = (await req.json()) as { slot: ScreenshotSlot; url: string | null };
  return handleWithRole(MUTATE_ROLES, () => setScreenshot(id, slot, url));
}
