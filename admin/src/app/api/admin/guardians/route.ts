import { listGuardians } from '@/lib/api/server/db';
import { handle } from '@/lib/api/server/http';

export async function GET() {
  // Open to all signed-in roles: the orders views need guardians for filters
  // and to show the customer on each order.
  return handle(() => listGuardians());
}
