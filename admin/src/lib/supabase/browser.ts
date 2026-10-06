'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client (anon key) for auth in Client Components — login and
 * sign-out. Session is stored in cookies so the server (middleware + route
 * handlers) can read it.
 */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
