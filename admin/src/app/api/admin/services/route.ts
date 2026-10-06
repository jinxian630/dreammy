import type { NextRequest } from 'next/server';
import type { ServiceCategory, ServiceInput, ServiceStatus } from '@/types';
import type { ServiceQuery } from '@/lib/api/types';
import { createService, listServices } from '@/lib/api/server/db';
import { handle, handleWithRole, intParam, param } from '@/lib/api/server/http';
import { MUTATE_ROLES } from '@/lib/auth/roles';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query: ServiceQuery = {
    search: param(url, 'search'),
    category: (param(url, 'category') as ServiceCategory | 'all') ?? 'all',
    status: (param(url, 'status') as ServiceStatus | 'all') ?? 'all',
    page: intParam(url, 'page') ?? 1,
    perPage: intParam(url, 'perPage') ?? 10,
  };
  // Open to all signed-in roles: the orders views need the service list for
  // filters and to show service names.
  return handle(() => listServices(query));
}

export async function POST(req: NextRequest) {
  const input = (await req.json()) as ServiceInput;
  return handleWithRole(MUTATE_ROLES, () => createService(input));
}
