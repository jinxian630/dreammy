# Dreammy — Image Asset Manifest

All illustration / photo / avatar / banner areas in the UI are **empty slots** rendered by
the `<x-image-slot key="..."/>` Blade component. Drop your artwork into the folders below using
the exact filenames, and it appears automatically — no code changes needed.

- **Central map:** [`config/dreammy.php`](../../../config/dreammy.php) → `images` array. Change a
  path there to point a key at a different file.
- **Missing files are safe:** if a file is absent, a plain empty placeholder of the correct
  aspect ratio is shown (no broken-image icon, no layout shift). The app runs regardless.
- **Formats:** PNG (transparency) or JPG/WebP (photographic). Use the transparency column below.
- **Do not** commit zero-byte placeholder images — leave the slot empty instead.
- All *interface text* (titles, prices, buttons, labels) is real HTML — never embed text in images.

> Recommended dimensions are guidance for crispness; the layout adapts to any file matching the
> aspect ratio. Provide ~2× for retina where practical.

## Brand — `brand/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `brand.logo` | `logo.png` | Top nav + footer logo mark | 96×96 | 1/1 | ✅ preferred |

## Backgrounds & heroes — `backgrounds/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `hero.home` | `hero-home.png` | Home hero banner | 1600×640 | 21/9 | optional |
| `hero.services` | `hero-services.png` | Services catalogue hero | 1600×520 | 21/9 | optional |
| `hero.service-detail` | `hero-service-detail.png` | Service details top artwork | 1200×760 | 16/10 | optional |
| `hero.checkout` | `hero-checkout.png` | Checkout hero | 1600×520 | 21/9 | optional |
| `hero.orders` | `hero-orders.png` | My Orders hero | 1600×520 | 21/9 | optional |
| `hero.order-tracking` | `hero-order-tracking.png` | Order tracking hero | 1600×520 | 21/9 | optional |
| `hero.wallet` | `hero-wallet.png` | Dream Wallet hero | 1600×520 | 21/9 | optional |
| `hero.rewards` | `hero-rewards.png` | Star Rewards hero | 1600×520 | 21/9 | optional |
| `hero.profile` | `hero-profile.png` | My Profile hero | 1600×520 | 21/9 | optional |
| `hero.help` | `hero-help.png` | Help & Security hero | 1600×560 | 21/9 | optional |
| `hero.confirmed` | `hero-confirmed.png` | Order confirmed hero | 1600×560 | 21/9 | optional |
| `banner.account-cared` | `banner-account-cared.png` | Home "Your account, cared for" band | 1400×360 | 21/9 | optional |
| `banner.orders-footer` | `banner-orders-footer.png` | My Orders footer band | 1400×360 | 21/9 | optional |
| `banner.rewards-footer` | `banner-rewards-footer.png` | Rewards quote band | 1400×320 | 21/9 | optional |
| `banner.wallet-footer` | `banner-wallet-footer.png` | Wallet quote band | 1400×320 | 21/9 | optional |
| `banner.profile-footer` | `banner-profile-footer.png` | Profile "Kindness travels far" band | 1400×320 | 21/9 | optional |
| `banner.help-support` | `banner-help-support.png` | Help "Still need a hand?" artwork | 700×560 | 5/4 | optional |
| `banner.checkout-thankyou` | `banner-checkout-thankyou.png` | Checkout / confirmed thank-you band | 700×560 | 5/4 | optional |

## Home tile icons — `decorations/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `icon.candle-runs` | `icon-candle-runs.png` | Home "Candle Runs" tile | 160×160 | 1/1 | ✅ preferred |
| `icon.heart-delivery` | `icon-heart-delivery.png` | Home "Heart Delivery" tile | 160×160 | 1/1 | ✅ preferred |
| `icon.season-passes` | `icon-season-passes.png` | Home "Season Passes" tile | 160×160 | 1/1 | ✅ preferred |
| `icon.companions` | `icon-companions.png` | Home "Companions" tile | 160×160 | 1/1 | ✅ preferred |
| `icon.more-adventures` | `icon-more-adventures.png` | Home "More Adventures" tile | 160×160 | 1/1 | ✅ preferred |

## Services — `services/`
Card thumbnails and the service-details hero share one key per service.
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `service.daily-candle-run` | `daily-candle-run.png` | Daily Candle Run card + detail + order thumbnails | 800×500 | 16/10 | optional |
| `service.heart-delivery` | `heart-delivery.png` | Heart Delivery card + detail | 800×500 | 16/10 | optional |
| `service.seasonal-care` | `seasonal-care.png` | Seasonal Care card + detail | 800×500 | 16/10 | optional |
| `service.sky-companion` | `sky-companion.png` | Sky Companion card + detail | 800×500 | 16/10 | optional |
| `service.winged-light` | `winged-light.png` | Winged Light card + detail | 800×500 | 16/10 | optional |
| `service.spirit-collection` | `spirit-collection.png` | Spirit Collection card + detail | 800×500 | 16/10 | optional |

## Wallet — `wallet/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `wallet.balance` | `wallet-balance.png` | Wallet balance card illustration | 360×360 | 1/1 | ✅ preferred |
| `wallet.pending` | `wallet-pending.png` | Pending withdrawal card illustration | 360×280 | 9/7 | ✅ preferred |
| `wallet.notice` | `wallet-notice.png` | Important notice signboard | 360×280 | 9/7 | ✅ preferred |

## Rewards — `rewards/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `rewards.figure` | `rewards-figure.png` | Your Star Points card figure | 480×360 | 4/3 | ✅ preferred |
| `reward.voucher-5` | `voucher-5.png` | RM5 voucher thumbnail | 480×300 | 16/10 | optional |
| `reward.voucher-10` | `voucher-10.png` | RM10 voucher thumbnail | 480×300 | 16/10 | optional |
| `reward.companion-discount` | `companion-discount.png` | Companion Discount thumbnail | 480×300 | 16/10 | optional |

## Avatars — `avatars/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `avatar.user` | `user.png` | Default user avatar (nav, profile) | 200×200 | 1/1 | ✅ preferred |
| `avatar.guardian-luna` | `guardian-luna.png` | Guardian avatar on order tracking | 200×200 | 1/1 | ✅ preferred |
| `favorite.guardian-luna` | `favorite-guardian-luna.png` | Profile favorite thumbnail | 200×140 | 10/7 | optional |
| `favorite.candle-run` | `favorite-candle-run.png` | Profile favorite thumbnail | 200×140 | 10/7 | optional |

## Security — `security/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `security.badge` | `security-badge.png` | Help "Account security" decorative badge | 240×240 | 1/1 | ✅ preferred |

## Status / evidence — `status/`
| Key | Filename | Appears | Recommended px | Ratio | Transparency |
|-----|----------|---------|----------------|-------|--------------|
| `evidence.before` | `evidence-before.png` | Order tracking "Before (Sample)" | 640×360 | 16/9 | optional |
| `evidence.latest` | `evidence-latest.png` | Order tracking "Latest Progress (Sample)" | 640×360 | 16/9 | optional |
