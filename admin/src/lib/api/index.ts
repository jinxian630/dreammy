import type { AdminApi } from './AdminApi';
import { httpAdapter } from './httpAdapter';

/**
 * The active data source for the whole admin app.
 *
 * Backed by Supabase via Next.js route handlers under `/api/admin/**` (see
 * `httpAdapter` + `src/lib/api/server/db.ts`). The secret key stays server-side.
 */
export const api: AdminApi = httpAdapter;

/** Live data (Supabase), not demo — UI hides the "Demo data" badges. */
export const IS_DEMO = false;

export type { AdminApi, VoucherWithStatus } from './AdminApi';
export type { OrderQuery, ServiceQuery, VoucherQuery, ScreenshotSlot } from './types';
