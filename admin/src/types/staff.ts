import type { Role } from '@/lib/auth/roles';

/**
 * A lightweight, non-sensitive view of an internal team member, used to
 * populate the order assignment picker. Only active members with a linked
 * Supabase auth user id are assignable.
 */
export interface StaffOption {
  userId: string;
  email: string;
  role: Role;
}
