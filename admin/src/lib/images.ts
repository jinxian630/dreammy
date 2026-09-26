/**
 * Central image-path map. Every artwork slot in the admin resolves its file
 * through here, so re-pointing a key to a different file is a one-line change.
 * Files are intentionally absent for now — <ImageSlot> renders an empty,
 * aspect-correct placeholder when the resolved file does not exist.
 */

const BASE = '/images/dreammy';

export const ADMIN_IMAGES = {
  'brand.logo': `${BASE}/brand/logo.png`,
  'avatar.admin': `${BASE}/avatars/admin.png`,
  'avatar.guardian-luna': `${BASE}/avatars/guardian-luna.png`,
  'avatar.guardian-nova': `${BASE}/avatars/guardian-nova.png`,
  'avatar.guardian-aurora': `${BASE}/avatars/guardian-aurora.png`,
  'avatar.guardian-lumi': `${BASE}/avatars/guardian-lumi.png`,
  'service.daily-candle-run': `${BASE}/services/daily-candle-run.png`,
  'service.heart-delivery': `${BASE}/services/heart-delivery.png`,
  'service.seasonal-care': `${BASE}/services/seasonal-care.png`,
  'service.sky-companion': `${BASE}/services/sky-companion.png`,
  'decoration.sidebar-sprig': `${BASE}/decorations/sidebar-sprig.png`,
} as const;

export type ImageKey = keyof typeof ADMIN_IMAGES;

/** Resolve a key (or a raw path) to a URL. Unknown keys return null. */
export function assetPath(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith('/') || key.startsWith('http') || key.startsWith('blob:')) {
    return key;
  }
  return (ADMIN_IMAGES as Record<string, string>)[key] ?? null;
}
