'use client';

import { useCallback, useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { LoadingRows, EmptyState } from '@/components/admin/States';
import { useToast } from '@/components/ui/Toast';
import { useCurrentMember } from '@/lib/auth/useCurrentMember';
import { ROLES, type Role } from '@/lib/auth/roles';
import { useI18n } from '@/lib/i18n/I18nProvider';
import type { TKey } from '@/lib/i18n/dictionary';
import { IconUser, IconUsers, IconPlus, IconTrash, IconCheck, IconX, IconClipboard } from '@/components/ui/icons';

interface TeamMember {
  id: string;
  email: string;
  role: Role;
  status: 'invited' | 'active';
  userId: string | null;
  createdAt: string | null;
}

/** What each role can do, mirroring the server rules in src/lib/auth/roles.ts. */
const CAPABILITIES: { labelKey: TKey; roles: Role[] }[] = [
  { labelKey: 'st.capViewBoard', roles: ['owner', 'admin', 'guardian'] },
  { labelKey: 'st.capClaim', roles: ['owner', 'admin', 'guardian'] },
  { labelKey: 'st.capViewOrders', roles: ['owner', 'admin'] },
  { labelKey: 'st.capViewDashboard', roles: ['owner', 'admin'] },
  { labelKey: 'st.capEditServices', roles: ['owner', 'admin'] },
  { labelKey: 'st.capManageOrders', roles: ['owner', 'admin'] },
  { labelKey: 'st.capManageTeam', roles: ['owner'] },
];

export default function SettingsPage() {
  const { notify } = useToast();
  const { member, loading: meLoading } = useCurrentMember();
  const { t } = useI18n();
  const isOwner = member?.role === 'owner';

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('guardian');
  const [password, setPassword] = useState('');
  const [inviting, setInviting] = useState(false);
  const [added, setAdded] = useState<{ email: string; password: string; emailSent: boolean } | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch('/api/admin/team');
    if (res.ok) setMembers((await res.json()) as TeamMember[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isOwner) load();
  }, [isOwner, load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      notify(t('st.passwordMin'), 'error');
      return;
    }
    setInviting(true);
    setAdded(null);
    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, password }),
    });
    const body = await res.json().catch(() => null);
    setInviting(false);
    if (!res.ok) {
      notify(body?.error ?? t('st.couldNotAdd'), 'error');
      return;
    }
    setAdded({ email, password, emailSent: Boolean(body.emailSent) });
    if (body.emailSent) {
      notify(`${t('st.invitationEmailedTo')} ${email}.`);
    } else {
      notify(`${t('st.memberAddedEmailFail')} ${body.emailError ?? t('st.smtpNotConfigured')}.`, 'error');
    }
    setEmail('');
    setRole('guardian');
    setPassword('');
    load();
  }

  function copyCredentials() {
    if (!added) return;
    const msg = [
      t('lg.title'),
      `${t('lg.signIn')}: ${window.location.origin}/login`,
      `${t('st.email')}: ${added.email}`,
      `${t('st.password')}: ${added.password}`,
    ].join('\n');
    navigator.clipboard.writeText(msg);
    notify(t('st.credentialsCopied'));
  }

  async function changeRole(m: TeamMember, nextRole: Role) {
    const res = await fetch(`/api/admin/team/${m.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: nextRole }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) {
      notify(body?.error ?? t('st.couldNotChangeRole'), 'error');
      return;
    }
    notify(t('st.roleUpdated'));
    load();
  }

  async function handleRemove() {
    if (!removing) return;
    setBusy(true);
    const res = await fetch(`/api/admin/team/${removing.id}`, { method: 'DELETE' });
    const body = await res.json().catch(() => null);
    setBusy(false);
    setRemoving(null);
    if (!res.ok) {
      notify(body?.error ?? t('st.couldNotRemove'), 'error');
      return;
    }
    notify(t('st.memberRemoved'));
    load();
  }

  return (
    <div>
      <PageHeader title={t('st.title')} subtitle={t('st.subtitle')} demo={false} />

      {/* Your account */}
      <Card className="mb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-blush text-primary">
            <IconUser width={22} height={22} />
          </span>
          <div>
            <p className="font-semibold text-plum">{meLoading ? '…' : member?.email ?? t('st.notSignedIn')}</p>
            {member && (
              <p className="text-sm text-ink-soft">
                {t('header.roleLabel')}: <Badge tone="info">{t(`role.${member.role}` as TKey)}</Badge>
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Roles & permissions */}
      <Card className="mb-5">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-lavender text-plum">
            <IconUsers width={22} height={22} />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-lg text-plum">{t('st.rolesPermissions')}</h2>
            <p className="mt-1 text-sm text-ink-soft">{t('st.rolesPermissionsSub')}</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-blush-soft text-left">
                <th className="py-2 pr-3 font-semibold text-plum">{t('st.capability')}</th>
                {ROLES.map((r) => (
                  <th
                    key={r}
                    className={`px-2 py-2 text-center font-semibold ${member?.role === r ? 'text-primary' : 'text-ink-soft'}`}
                  >
                    {t(`role.${r}` as TKey)}
                    {member?.role === r && <span className="block text-[10px] font-normal">{t('st.you')}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITIES.map((cap) => (
                <tr key={cap.labelKey} className="border-b border-blush-soft/60">
                  <td className="py-2.5 pr-3 text-ink">{t(cap.labelKey)}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-2 py-2.5">
                      <div className="flex justify-center">
                        {cap.roles.includes(r) ? (
                          <IconCheck width={16} height={16} className="text-primary" aria-label={t('st.allowed')} />
                        ) : (
                          <IconX width={14} height={14} className="text-ink-soft/40" aria-label={t('st.notAllowed')} />
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-ink-soft">
          <strong>{t('st.guardians')}</strong> {t('st.rolesHelpGuardian')}{' '}
          <strong>{t('st.admins')}</strong> {t('st.rolesHelpAdmin')}{' '}
          <strong>{t('st.owners')}</strong> {t('st.rolesHelpOwner')}
        </p>
      </Card>

      {isOwner && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Members list */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <IconUsers width={18} height={18} />
                </span>
                <div>
                  <h2 className="font-display text-lg text-plum">{t('st.teamMembers')}</h2>
                  <p className="text-sm text-ink-soft">{t('st.teamMembersSub')}</p>
                </div>
              </div>

              <div className="mt-4">
                {loading ? (
                  <LoadingRows />
                ) : members.length === 0 ? (
                  <EmptyState icon={IconUser} title={t('st.noMembers')} description={t('st.noMembersDesc')} />
                ) : (
                  <ul className="divide-y divide-blush-soft">
                    {members.map((m) => (
                      <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-plum">{m.email}</p>
                          <Badge tone={m.status === 'active' ? 'success' : 'warn'} className="mt-1">
                            {m.status === 'active' ? t('st.active') : t('st.invited')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            aria-label={`${t('st.roleFor')} ${m.email}`}
                            value={m.role}
                            onChange={(e) => changeRole(m, e.target.value as Role)}
                            className="h-9 w-32"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>
                                {t(`role.${r}` as TKey)}
                              </option>
                            ))}
                          </Select>
                          <Button variant="ghost" size="sm" className="text-danger" onClick={() => setRemoving(m)} aria-label={`${t('st.remove')} ${m.email}`}>
                            <IconTrash width={15} height={15} />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Card>
          </div>

          {/* Invite form */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <IconPlus width={18} height={18} />
                </span>
                <div>
                  <h2 className="font-display text-lg text-plum">{t('st.addMember')}</h2>
                  <p className="text-sm text-ink-soft">{t('st.addMemberSub')}</p>
                </div>
              </div>

              <form onSubmit={handleInvite} className="mt-4 space-y-4">
                <Field label={t('st.email')} htmlFor="invite-email" required>
                  <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@example.com" />
                </Field>
                <Field label={t('st.role')} htmlFor="invite-role" required hint={t(`roleDesc.${role}` as TKey)}>
                  <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {t(`role.${r}` as TKey)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t('st.password')} htmlFor="invite-password" required hint={t('st.passwordHint')}>
                  <Input id="invite-password" type="text" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('st.passwordPh')} />
                </Field>
                <Button type="submit" block disabled={inviting}>
                  <IconPlus width={18} height={18} /> {inviting ? t('st.adding') : t('st.addMember')}
                </Button>
              </form>

              {added && (
                <div className="mt-4 rounded-2xl border border-blush-soft bg-surface-soft p-3">
                  <p className="text-xs font-semibold text-plum">
                    {added.emailSent ? `${t('st.invitationEmailedTo')} ${added.email}` : t('st.emailNotSent')}
                  </p>
                  <dl className="mt-1 space-y-0.5 text-xs text-ink-soft">
                    <div className="flex gap-2"><dt className="text-ink-muted">{t('st.email')}</dt><dd className="break-all font-medium">{added.email}</dd></div>
                    <div className="flex gap-2"><dt className="text-ink-muted">{t('st.password')}</dt><dd className="break-all font-medium">{added.password}</dd></div>
                  </dl>
                  <Button variant="outline" size="sm" className="mt-2" onClick={copyCredentials}>
                    <IconClipboard width={15} height={15} /> {t('st.copyCredentials')}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={removing !== null}
        title={t('st.confirmRemoveTitle')}
        description={`${removing?.email ?? ''} ${t('st.confirmRemoveSuffix')}`}
        confirmLabel={t('st.confirmRemoveBtn')}
        tone="danger"
        busy={busy}
        onConfirm={handleRemove}
        onCancel={() => setRemoving(null)}
      />
    </div>
  );
}
