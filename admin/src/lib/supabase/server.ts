import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the SECRET (service_role) key.
 *
 * `import 'server-only'` makes the build fail if this module is ever imported
 * into a Client Component, so the secret key can never reach the browser. Use
 * this ONLY inside route handlers under `src/app/api/admin/**`.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

let client: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (!url || !secret) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in admin/.env.local',
    );
  }
  if (!client) {
    client = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const SERVICE_IMAGES_BUCKET =
  process.env.SUPABASE_SERVICE_IMAGES_BUCKET ?? 'service-images';
export const ORDER_SCREENSHOTS_BUCKET =
  process.env.SUPABASE_ORDER_SCREENSHOTS_BUCKET ?? 'order-screenshots';
