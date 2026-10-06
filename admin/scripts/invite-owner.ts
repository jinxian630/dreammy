/**
 * Bootstrap the first admin OWNER (nobody can invite until one owner exists).
 *
 *   npx tsx scripts/invite-owner.ts you@example.com                 # invite by email + link
 *   npx tsx scripts/invite-owner.ts you@example.com "YourPass123"   # direct password (no email needed)
 *   # or: npm run invite-owner -- you@example.com "YourPass123"
 *
 * With a password, the owner is created active and can sign in immediately at
 * /login (no SMTP or redirect-URL config required). Without one, a cloud invite
 * email is sent and a copyable invite link is printed.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const adminDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    try {
      const txt = readFileSync(resolve(adminDir, file), 'utf8');
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && process.env[m[1]] === undefined) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
        }
      }
    } catch {
      /* file may not exist */
    }
  }
}
loadEnv();

const email = process.argv[2];
if (!email) {
  console.error('Usage: npx tsx scripts/invite-owner.ts <email>');
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3100';
if (!url || !secret) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in admin/.env.local');
  process.exit(1);
}
const redirectTo = `${site}/auth/callback?next=/set-password`;
const sb = createClient(url, secret, { auth: { persistSession: false } });

const password = process.argv[3];

async function findUserId(emailLc: string): Promise<string | null> {
  const list = await sb.auth.admin.listUsers();
  return list.data.users.find((u) => u.email?.toLowerCase() === emailLc)?.id ?? null;
}

async function main() {
  const emailLc = email.toLowerCase();

  if (password) {
    // Direct setup: create (or update) a confirmed user with a password, active owner.
    const created = await sb.auth.admin.createUser({
      email: emailLc,
      password,
      email_confirm: true,
      user_metadata: { role: 'owner' },
    });
    let userId = created.data.user?.id ?? null;
    if (created.error) {
      userId = await findUserId(emailLc);
      if (userId) await sb.auth.admin.updateUserById(userId, { password, email_confirm: true });
    }
    const { error: upErr } = await sb
      .from('team_members')
      .upsert({ email: emailLc, role: 'owner', status: 'active', user_id: userId }, { onConflict: 'email' });
    if (upErr) throw new Error(upErr.message);
    console.log('\n✅ Owner ready (active):', emailLc);
    console.log('   Sign in at', `${site}/login`, 'with this email and your password.\n');
    return;
  }

  const { error: upErr } = await sb
    .from('team_members')
    .upsert({ email: emailLc, role: 'owner', status: 'invited' }, { onConflict: 'email' });
  if (upErr) throw new Error(upErr.message);

  const invite = await sb.auth.admin.inviteUserByEmail(emailLc, {
    data: { role: 'owner' },
    redirectTo,
  });
  const gen = await sb.auth.admin.generateLink({
    type: 'magiclink',
    email: emailLc,
    options: { redirectTo },
  });

  console.log('\n✅ Owner bootstrapped:', emailLc);
  console.log('   Email sent:', !invite.error, invite.error ? `(${invite.error.message})` : '');
  console.log('   Invite link:', gen.data?.properties?.action_link ?? '(could not generate)');
  console.log('\nOpen the link → set a password → you are the owner.\n');
}

main().catch((e) => {
  console.error('Failed:', e.message ?? e);
  process.exit(1);
});
