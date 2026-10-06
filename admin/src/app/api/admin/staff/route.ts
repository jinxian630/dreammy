import { listStaff } from '@/lib/api/server/db';
import { handleWithRole } from '@/lib/api/server/http';
import { ROLES } from '@/lib/auth/roles';

/** Assignable team members — readable by any active member (incl. viewers). */
export async function GET() {
  return handleWithRole(ROLES, () => listStaff());
}
