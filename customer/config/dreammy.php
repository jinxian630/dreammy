<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Brand
    |--------------------------------------------------------------------------
    */
    'brand' => [
        'name' => 'Dreammy',
        'tagline' => 'For a kinder Sky together',
    ],

    /*
    |--------------------------------------------------------------------------
    | Money / currency
    |--------------------------------------------------------------------------
    | Amounts are stored everywhere as integer minor units (sen). Never floats.
    */
    'currency' => [
        'code' => 'MYR',
        'symbol' => 'RM',
        'minor_per_major' => 100,
    ],

    /*
    |--------------------------------------------------------------------------
    | Points & rewards (light — see MVP Plan v3 §6 M8)
    |--------------------------------------------------------------------------
    */
    'points' => [
        'per_myr_sen' => 1,          // MYR 0.01 = 1 point  (RM1 = 100 points)
        'redemption_rate' => 2000,   // 2,000 points = RM1.00 of catalogue value
        'expiry_months' => 12,
        'band_c_per_customer_30d' => 1,
    ],

    /*
    |--------------------------------------------------------------------------
    | Order rules (configurable — do not hard-code business rules in views)
    |--------------------------------------------------------------------------
    */
    'rules' => [
        'hearts_cn_daily_cap' => 10,
        'gifting_min_friend_hours' => 72,
        'friend_tree_unlock_sen' => 150, // RM1.50
    ],

    /*
    |--------------------------------------------------------------------------
    | Image map  — the single place to point keys at real files.
    |--------------------------------------------------------------------------
    | <x-image-slot key="..."/> resolves through this map. If the file is
    | absent, an empty placeholder is rendered (no broken image). Drop your
    | artwork into public/images/dreammy/** using the filenames below, or
    | remap a key here to a different path.
    */
    'images' => [

        // Brand
        'brand.logo' => 'images/dreammy/brand/logo.png',
        'brand.logo-footer' => 'images/dreammy/brand/logo.png',

        // Hero backgrounds (one per page)
        'hero.home' => 'images/dreammy/backgrounds/hero-home.png',
        'hero.services' => 'images/dreammy/backgrounds/hero-services.png',
        'hero.service-detail' => 'images/dreammy/backgrounds/hero-service-detail.png',
        'hero.checkout' => 'images/dreammy/backgrounds/hero-checkout.png',
        'hero.orders' => 'images/dreammy/backgrounds/hero-orders.png',
        'hero.order-tracking' => 'images/dreammy/backgrounds/hero-order-tracking.png',
        'hero.wallet' => 'images/dreammy/backgrounds/hero-wallet.png',
        'hero.rewards' => 'images/dreammy/backgrounds/hero-rewards.png',
        'hero.profile' => 'images/dreammy/backgrounds/hero-profile.png',
        'hero.help' => 'images/dreammy/backgrounds/hero-help.png',
        'hero.confirmed' => 'images/dreammy/backgrounds/hero-confirmed.png',

        // Promotional / footer banners
        'banner.account-cared' => 'images/dreammy/backgrounds/banner-account-cared.png',
        'banner.orders-footer' => 'images/dreammy/backgrounds/banner-orders-footer.png',
        'banner.rewards-footer' => 'images/dreammy/backgrounds/banner-rewards-footer.png',
        'banner.wallet-footer' => 'images/dreammy/backgrounds/banner-wallet-footer.png',
        'banner.profile-footer' => 'images/dreammy/backgrounds/banner-profile-footer.png',
        'banner.help-support' => 'images/dreammy/backgrounds/banner-help-support.png',
        'banner.checkout-thankyou' => 'images/dreammy/backgrounds/banner-checkout-thankyou.png',

        // Home "How can we help?" tile icons
        'icon.candle-runs' => 'images/dreammy/decorations/icon-candle-runs.png',
        'icon.heart-delivery' => 'images/dreammy/decorations/icon-heart-delivery.png',
        'icon.season-passes' => 'images/dreammy/decorations/icon-season-passes.png',
        'icon.companions' => 'images/dreammy/decorations/icon-companions.png',
        'icon.more-adventures' => 'images/dreammy/decorations/icon-more-adventures.png',

        // Service artwork (card thumbnail + detail hero share the same key)
        'service.daily-candle-run' => 'images/dreammy/services/daily-candle-run.png',
        'service.heart-delivery' => 'images/dreammy/services/heart-delivery.png',
        'service.seasonal-care' => 'images/dreammy/services/seasonal-care.png',
        'service.sky-companion' => 'images/dreammy/services/sky-companion.png',
        'service.winged-light' => 'images/dreammy/services/winged-light.png',
        'service.spirit-collection' => 'images/dreammy/services/spirit-collection.png',

        // Wallet
        'wallet.balance' => 'images/dreammy/wallet/wallet-balance.png',
        'wallet.pending' => 'images/dreammy/wallet/wallet-pending.png',
        'wallet.notice' => 'images/dreammy/wallet/wallet-notice.png',

        // Rewards
        'rewards.figure' => 'images/dreammy/rewards/rewards-figure.png',
        'reward.voucher-5' => 'images/dreammy/rewards/voucher-5.png',
        'reward.voucher-10' => 'images/dreammy/rewards/voucher-10.png',
        'reward.companion-discount' => 'images/dreammy/rewards/companion-discount.png',

        // Avatars
        'avatar.user' => 'images/dreammy/avatars/user.png',
        'avatar.guardian-luna' => 'images/dreammy/avatars/guardian-luna.png',
        'favorite.guardian-luna' => 'images/dreammy/avatars/favorite-guardian-luna.png',
        'favorite.candle-run' => 'images/dreammy/avatars/favorite-candle-run.png',

        // Security (help page)
        'security.badge' => 'images/dreammy/security/security-badge.png',

        // Order tracking sample evidence
        'evidence.before' => 'images/dreammy/status/evidence-before.png',
        'evidence.latest' => 'images/dreammy/status/evidence-latest.png',
    ],
];
