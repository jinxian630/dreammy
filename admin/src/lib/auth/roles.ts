/**
 * Role-based access control for the admin app. Shared by server (enforcement)
 * and client (UI gating). The server checks are the real security boundary; the
 * UI uses these only to hide controls the user can't use.
 */
export type Role = 'owner' | 'admin' | 'guardian';

export const ROLES: Role[] = ['owner', 'admin', 'guardian'];

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  guardian: 'Guardian',
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full access, including managing the team.',
  admin: 'Full access except team management.',
  guardian: 'Can only access the Order Status board.',
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as string[]).includes(value);
}

/**
 * Coerce a stored role string into a valid Role. Legacy `viewer` rows map to
 * `guardian` (the role was renamed), and anything unknown falls back to the
 * least-privileged role so a bad value never grants extra access.
 */
export function normalizeRole(value: unknown): Role {
  if (value === 'viewer') return 'guardian';
  return isRole(value) ? value : 'guardian';
}

/** Roles allowed to create/edit/delete business data (services, vouchers, orders). */
export const MUTATE_ROLES: Role[] = ['owner', 'admin'];

/** Roles with full read access to every section. Viewers are limited to orders. */
export const VIEW_ALL_ROLES: Role[] = ['owner', 'admin'];

/** Roles allowed to manage the team (invite / change role / remove). */
export function canManageTeam(role: Role): boolean {
  return role === 'owner';
}

/** Roles allowed to mutate business data. */
export function canMutate(role: Role): boolean {
  return MUTATE_ROLES.includes(role);
}

/**
 * Whether a role may open a given /admin page. Guardians are restricted to the
 * Order Status board only; every other role may view everything. Mirrors the
 * server-side read gating so the nav and route guard stay in sync.
 */
export function canViewPath(role: Role, pathname: string): boolean {
  if (role !== 'guardian') return true;
  return pathname.startsWith('/admin/order-status');
}

/** Landing page for a role — where to send someone who hits a page they can't see. */
export function homePathForRole(role: Role): string {
  return role === 'guardian' ? '/admin/order-status' : '/admin';
}
