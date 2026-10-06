import type { NextRequest } from 'next/server';
import { getOrder } from '@/lib/api/server/db';
import { handle } from '@/lib/api/server/http';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  return handle(() => getOrder(id));
}
