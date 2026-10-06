'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentMember } from '@/lib/auth/useCurrentMember';
import { canViewPath, homePathForRole } from '@/lib/auth/roles';

/**
 * Client-side route guard. Keeps guardians (Order Status only) out of pages they
 * can't see by redirecting them to their landing page. This is a UX convenience;
 * the real boundary is the server read gating (VIEW_ALL_ROLES) in the API routes.
 */
export function AccessGuard({ children }: { children: React.ReactNode }) {
  const { member, loading } = useCurrentMember();
  const pathname = usePathname();
  const router = useRouter();

  const blocked = member !== null && !canViewPath(member.role, pathname);

  useEffect(() => {
    if (blocked && member) router.replace(homePathForRole(member.role));
  }, [blocked, member, router]);

  // Don't render the page until the role is known. Otherwise a restricted page
  // (e.g. the dashboard) would mount and fire its gated fetch — a 403 — during
  // the brief window before the redirect lands. The layout stays mounted across
  // client navigations, so this only costs one /api/admin/me wait per full load.
  if (loading) return null;
  if (blocked) return null;
  return <>{children}</>;
}
