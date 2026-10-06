import 'server-only';
import { supabaseServer } from '@/lib/supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase/server';
import { normalizeRole, type Role } from './roles';

export interface Member {
  userId: string;
  email: string;
  role: Role;
  status: 'invited' | 'active';
}

/** HTTP-coded error so `handle()` can map it to 401/403. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * The signed-in admin team member (session user + their role row), or null when
 * not authenticated or not a provisioned team member.
 */
export async function getCurrentMember(): Promise<Member | null> {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return null;

  // Role lookup uses the secret-key client to bypass RLS (service-role).
  const { data } = await supabaseAdmin()
    .from('team_members')
    .select('role, status, email')
    .eq('user_id', user.id)
    .maybeSingle();
  if (!data) return null;

  return {
    userId: user.id,
    email: (data.email as string) ?? user.email ?? '',
    role: normalizeRole(data.role),
    status: (data.status as Member['status']) ?? 'invited',
  };
}

/**
 * Ensure the caller is an active member with one of `allowed` roles.
 * Throws HttpError(401) when unauthenticated, HttpError(403) when not permitted.
 */
export async function requireRole(allowed: Role[]): Promise<Member> {
  const member = await getCurrentMember();
  if (!member || member.status !== 'active') {
    throw new HttpError(401, 'Not authenticated.');
  }
  if (!allowed.includes(member.role)) {
    throw new HttpError(403, 'You do not have permission to do this.');
  }
  return member;
}
