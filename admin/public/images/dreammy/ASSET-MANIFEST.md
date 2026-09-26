# Dreammy Admin — Image Asset Manifest

Every illustration / photo / avatar area in the admin UI is an **empty reserved slot** rendered by
`<ImageSlot />` (`src/components/admin/ImageSlot.tsx`). Drop artwork into the folders below using the
exact filenames and it appears automatically — no code changes needed.

- **Central map:** all paths live in `src/lib/images.ts` (`assetPath()` + `ADMIN_IMAGES`). Change a
  value there to point a key at a different file.
- **Missing files are safe:** when a file is absent, a plain empty placeholder of the correct aspect
  ratio is shown — no broken-image icon and no layout shift. The app runs regardless.
- **Do not** commit zero-byte placeholder images — leave the slot empty (`.gitkeep` only).
- All interface text (titles, prices, buttons, labels) is real HTML — never embed text in images.
- Uploaded images in admin forms are **local previews only** (object URLs). Nothing is sent to a
  server until the Laravel/Firebase backend is wired.

> Recommended dimensions are guidance for crispness; the layout adapts to any file matching the
> aspect ratio. Provide ~2× for retina where practical.

## Brand — `brand/`
| Key | Filename | Appears | Recommended px | Ratio |
|-----|----------|---------|----------------|-------|
| `brand.logo` | `logo.png` | Sidebar + header logo mark | 96×96 | 1/1 |

## Avatars — `avatars/`
| Key | Filename | Appears | Recommended px | Ratio |
|-----|----------|---------|----------------|-------|
| `avatar.admin` | `admin.png` | Header account chip | 200×200 | 1/1 |
| `avatar.guardian-luna` | `guardian-luna.png` | Order details guardian | 200×200 | 1/1 |
| `avatar.guardian-nova` | `guardian-nova.png` | Orders list / details | 200×200 | 1/1 |
| `avatar.guardian-aurora` | `guardian-aurora.png` | Orders list / details | 200×200 | 1/1 |
| `avatar.guardian-lumi` | `guardian-lumi.png` | Orders list / details | 200×200 | 1/1 |

## Services — `services/`
Card thumbnails in the service catalogue, order rows, and the live form preview share one key/service.
| Key | Filename | Appears | Recommended px | Ratio |
|-----|----------|---------|----------------|-------|
| `service.daily-candle-run` | `daily-candle-run.png` | Service list + order thumb + form preview | 800×500 | 16/10 |
| `service.heart-delivery` | `heart-delivery.png` | Service list + order thumb | 800×500 | 16/10 |
| `service.seasonal-care` | `seasonal-care.png` | Service list + order thumb | 800×500 | 16/10 |
| `service.sky-companion` | `sky-companion.png` | Service list + order thumb | 800×500 | 16/10 |

## Order evidence — `services/` (reused) or drop into `backgrounds/`
The order-details "Before / After" screenshot fields are **admin upload slots** (local preview only);
no seed files are required. Recommended capture size 1280×720 (16/9).

## Backgrounds & decorations — `backgrounds/`, `decorations/`
| Key | Filename | Appears | Recommended px | Ratio |
|-----|----------|---------|----------------|-------|
| `decoration.sidebar-sprig` | `sidebar-sprig.png` | Sidebar footer cherry-blossom sprig | 320×420 | 3/4 |
| `background.auth` | `auth.png` | (reserved) future admin sign-in art | 1600×1200 | 4/3 |
