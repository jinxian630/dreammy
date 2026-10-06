import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { HttpError } from '@/lib/auth/session';
import { normalizeRole, type Role } from '@/lib/auth/roles';
import { sendMemberInvite } from '@/lib/api/server/mail';

export interface TeamMember {
  id: string;
  email: string;
  role: Role;
  status: 'invited' | 'active';
  userId: string | null;
  createdAt: string | null;
}

interface TeamRow {
  id: number | string;
  email: string;
  role: string;
  status: string;
  user_id: string | null;
  created_at: string | null;
}

function rowToMember(row: TeamRow): TeamMember {
  return {
    id: String(row.id),
    email: row.email,
    role: normalizeRole(row.role),
    status: row.status === 'active' ? 'active' : 'invited',
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function listMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabaseAdmin()
    .from('team_members')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data as unknown as TeamRow[]).map(rowToMember);
}

export interface InviteResult {
  member: TeamMember;
  emailSent: boolean;
  emailError: string | null;
}

export async function inviteMember(
  email: string,
  role: Role,
  password: string,
  invitedBy: string | null,
): Promise<InviteResult> {
  const emailLc = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailLc)) {
    throw new HttpError(400, 'Enter a valid email address.');
  }
  if (password.length < 8) {
    throw new HttpError(400, 'Password must be at least 8 characters.');
  }
  const sb = supabaseAdmin();

  // Create the Supabase auth user with the owner-chosen password, already
  // confirmed so they can sign in immediately — no email or magic link needed.
  let authUserId: string | null = null;
  const created = await sb.auth.admin.createUser({
    email: emailLc,
    password,
    email_confirm: true,
    user_metadata: { role },
  });
  if (created.error) {
    // Most likely the address already has an auth user — reset its password instead.
    const existingId = await authUserIdByEmail(emailLc);
    if (!existingId) throw new Error(created.error.message);
    const updated = await sb.auth.admin.updateUserById(existingId, {
      password,
      email_confirm: true,
      user_metadata: { role },
    });
    if (updated.error) throw new Error(updated.error.message);
    authUserId = existingId;
  } else {
    authUserId = created.data.user?.id ?? null;
  }

  // Record the member as active and linked to the auth user.
  const { data: upserted, error: upErr } = await sb
    .from('team_members')
    .upsert(
      { email: emailLc, role, status: 'active', user_id: authUserId, invited_by: invitedBy },
      { onConflict: 'email' },
    )
    .select('*')
    .single();
  if (upErr) throw new Error(upErr.message);

  // Email the member their sign-in link + credentials (best-effort: the member
  // is created regardless, so the owner can still share the details manually).
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3100';
  const mail = await sendMemberInvite({ to: emailLc, password, role, loginUrl: `${base}/login` });
  if (!mail.sent) {
    console.error('[invite] credentials email failed for', emailLc, '→', mail.error);
  }

  return {
    member: rowToMember(upserted as unknown as TeamRow),
    emailSent: mail.sent,
    emailError: mail.error,
  };
}

/** Best-effort lookup of a Supabase auth user id by email (for cleanup). */
async function authUserIdByEmail(email: string): Promise<string | null> {
  const emailLc = email.toLowerCase();
  const { data } = await supabaseAdmin().auth.admin.listUsers({ page: 1, perPage: 1000 });
  return data?.users.find((u) => u.email?.toLowerCase() === emailLc)?.id ?? null;
}

async function ownerCount(): Promise<number> {
  const { count } = await supabaseAdmin()
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'owner');
  return count ?? 0;
}

export async function updateMemberRole(id: string, role: Role): Promise<TeamMember> {
  const sb = supabaseAdmin();
  const { data: current } = await sb.from('team_members').select('*').eq('id', id).maybeSingle();
  if (!current) throw new HttpError(404, 'Member not found.');
  if ((current as TeamRow).role === 'owner' && role !== 'owner' && (await ownerCount()) <= 1) {
    throw new HttpError(400, 'There must be at least one owner.');
  }
  const { data, error } = await sb
    .from('team_members')
    .update({ role })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return rowToMember(data as unknown as TeamRow);
}

export async function deleteMember(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { data: current } = await sb.from('team_members').select('*').eq('id', id).maybeSingle();
  if (!current) return;
  const row = current as TeamRow;
  if (row.role === 'owner' && (await ownerCount()) <= 1) {
    throw new HttpError(400, 'You cannot remove the last owner.');
  }
  const { error } = await sb.from('team_members').delete().eq('id', id);
  if (error) throw new Error(error.message);

  // Remove the Supabase auth user too. Accepted members have user_id; invited
  // members that never accepted don't, so fall back to an email lookup.
  const authId = row.user_id ?? (await authUserIdByEmail(row.email));
  if (authId) {
    await sb.auth.admin.deleteUser(authId).catch(() => undefined);
  }
}
