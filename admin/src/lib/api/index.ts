import type { AdminApi } from './AdminApi';
import { mockAdapter } from './mockAdapter';

/**
 * The active data source for the whole admin app.
 *
 * DEMO MODE: this is the in-memory mock adapter. To connect the real Laravel
 * API later, implement `AdminApi` with `fetch` calls (see BACKEND.md) and swap
 * the assignment below — no page/component changes required.
 *
 *   export const api: AdminApi = httpAdapter;
 */
export const api: AdminApi = mockAdapter;

/** Single flag the UI reads to show the "Demo data" badges. */
export const IS_DEMO = true;

export type { AdminApi, VoucherWithStatus } from './AdminApi';
export type { OrderQuery, ServiceQuery, VoucherQuery, ScreenshotSlot } from './types';
