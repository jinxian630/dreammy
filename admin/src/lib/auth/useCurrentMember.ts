'use client';

import { useEffect, useState } from 'react';
import type { Role } from './roles';

export interface CurrentMember {
  userId: string;
  email: string;
  role: Role;
  status: 'invited' | 'active';
}

/** Fetches the signed-in member ({ email, role, ... }) from /api/admin/me. */
export function useCurrentMember() {
  const [member, setMember] = useState<CurrentMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((m: CurrentMember | null) => {
        if (active) {
          setMember(m);
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return { member, loading };
}
