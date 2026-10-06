import type { NextRequest } from 'next/server';
import { assignStaff, getOrder } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { HttpError } from '@/lib/auth/session';
import { ROLES } from '@/lib/auth/roles';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { staffId } = (await req.json()) as { staffId: string | null };
  // All active members may assign. Guardians may only assign an order to
  // themselves, or release one that is currently assigned to them.
  return handleWithRole(ROLES, async (member) => {
    if (member.role === 'guardian') {
      if (staffId === member.userId) {
        // self-assign — allowed
      } else if (staffId === null) {
        const current = await getOrder(id);
        if (current?.assignment?.staffId !== member.userId) {
          throw new HttpError(403, 'Guardians can only release orders assigned to them.');
        }
      } else {
        throw new HttpError(403, 'Guardians can only assign orders to themselves.');
      }
    }
    return assignStaff(id, staffId ?? null, member);
  });
}
