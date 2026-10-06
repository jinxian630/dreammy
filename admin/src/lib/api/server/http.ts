import 'server-only';
import { NextResponse } from 'next/server';
import { HttpError, requireRole, type Member } from '@/lib/auth/session';
import type { Role } from '@/lib/auth/roles';

/** Wrap a handler so thrown errors become a clean JSON response (401/403/500). */
export async function handle<T>(fn: () => Promise<T>): Promise<NextResponse> {
  try {
    const data = await fn();
    return NextResponse.json(data ?? null);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof Error ? err.message : 'Unexpected error';
    if (status >= 500) console.error('[admin api]', message);
    return NextResponse.json({ error: message }, { status });
  }
}

/** Like `handle`, but first requires the caller to have one of `roles`. */
export async function handleWithRole<T>(
  roles: Role[],
  fn: (member: Member) => Promise<T>,
): Promise<NextResponse> {
  return handle(async () => {
    const member = await requireRole(roles);
    return fn(member);
  });
}

/** Parse a comma/array-free query value with a fallback. */
export function param(url: URL, key: string): string | undefined {
  const v = url.searchParams.get(key);
  return v === null || v === '' ? undefined : v;
}

export function intParam(url: URL, key: string): number | undefined {
  const v = param(url, key);
  return v === undefined ? undefined : Number(v);
}
