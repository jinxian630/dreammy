import { getCurrentMember } from '@/lib/auth/session';
import { handle } from '@/lib/api/server/http';

/** Returns the signed-in member ({ userId, email, role, status }) or null. */
export async function GET() {
  return handle(() => getCurrentMember());
}
