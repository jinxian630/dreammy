<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Enums\PointTransactionType;
use App\Enums\WalletTransactionType;
use App\Models\Category;
use App\Models\Faq;
use App\Models\Favorite;
use App\Models\Order;
use App\Models\OrderEvent;
use App\Models\PointTransaction;
use App\Models\RewardItem;
use App\Models\Service;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

/**
 * DEVELOPMENT SEED DATA ONLY.
 * Populates a demo traveller (LunaDreamer), the service catalogue, sample orders,
 * a wallet ledger, star points, rewards and FAQs so every page has realistic data.
 * Do NOT run in production.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $categories = $this->seedCategories();
        $services = $this->seedServices($categories);
        $user = $this->seedUser();
        $this->seedOrders($user, $services);
        $this->seedWallet($user);
        $this->seedPoints($user);
        $this->seedRewards();
        $this->seedFavorites($user);
        $this->seedFaqs();
    }

    /** @return array<string,Category> */
    private function seedCategories(): array
    {
        $defs = [
            'candle-runs' => 'Candle Runs',
            'taxi-services' => 'Taxi Services',
            'hearts' => 'Hearts',
            'seasons' => 'Seasons',
            'companions' => 'Companions',
            'more' => 'More',
        ];

        $out = [];
        $sort = 1;
        foreach ($defs as $slug => $name) {
            $out[$slug] = Category::updateOrCreate(['slug' => $slug], ['name' => $name, 'sort' => $sort++]);
        }

        return $out;
    }

    /** @return array<string,Service> */
    private function seedServices(array $categories): array
    {
        $tail = [
            ['key' => 'guardian_pref', 'label' => 'Guardian preference', 'type' => 'choice', 'icon' => 'users', 'default' => 'any', 'choices' => [
                ['value' => 'any', 'label' => 'Any Guardian', 'price_minor' => 0],
                ['value' => 'choose', 'label' => 'Choose Guardian', 'price_minor' => 300],
            ]],
            ['key' => 'special_requests', 'label' => 'Special requests (optional)', 'type' => 'text', 'icon' => 'edit', 'max' => 200, 'placeholder' => 'E.g. preferred realms, event areas, or other notes...'],
        ];

        $serverOpt = ['key' => 'server', 'label' => 'Server', 'type' => 'choice', 'icon' => 'globe', 'required' => true, 'default' => 'global', 'choices' => [
            ['value' => 'global', 'label' => 'Global', 'price_minor' => 0],
            ['value' => 'china', 'label' => 'China', 'price_minor' => 0],
        ]];

        $planOpt = ['key' => 'plan', 'label' => 'Plan', 'type' => 'choice', 'icon' => 'calendar', 'required' => true, 'default' => 'one_day', 'choices' => [
            ['value' => 'one_day', 'label' => 'One day', 'price_minor' => 0],
            ['value' => 'seven_days', 'label' => '7 days', 'price_minor' => 4900],
            ['value' => 'thirty_days', 'label' => '30 days', 'price_minor' => 18900],
        ]];

        $defs = [
            [
                'slug' => 'daily-candle-run', 'name' => 'Daily Candle Run', 'category' => 'candle-runs',
                'tagline' => 'More candles, more possibilities.', 'price_minor' => 890, 'image_key' => 'service.daily-candle-run',
                'rating' => 4.9, 'reviews' => 1248, 'popular' => true, 'sort' => 1,
                'description' => "Let our Guardians collect candles while you focus on what you love. Explore, make friends and enjoy your Sky journey — we'll take care of the daily run.",
                'inclusions' => [
                    'Full daily candle run across all major realms',
                    'Collect all available wax (approx. 15–20 candles)',
                    'Light seasonal candles and event areas (when available)',
                    'Friendly and professional Guardians',
                    'Delivery is made to your account safely',
                    'Progress updates (optional)',
                ],
                'schema' => ['options' => array_merge([$serverOpt, $planOpt,
                    ['key' => 'target', 'label' => 'Candle target', 'type' => 'choice', 'icon' => 'sparkle', 'required' => true, 'default' => '20', 'choices' => [
                        ['value' => '15', 'label' => '15 candles', 'price_minor' => 0],
                        ['value' => '20', 'label' => '20 candles', 'price_minor' => 0],
                    ]],
                    ['key' => 'preferred_time', 'label' => 'Preferred time', 'type' => 'select', 'icon' => 'clock', 'default' => 'any', 'choices' => [
                        ['value' => 'any', 'label' => 'Any time (recommended)', 'price_minor' => 0],
                        ['value' => 'morning', 'label' => 'Morning', 'price_minor' => 0],
                        ['value' => 'evening', 'label' => 'Evening', 'price_minor' => 0],
                    ]],
                ], $tail)],
            ],
            [
                'slug' => 'heart-delivery', 'name' => 'Heart Delivery', 'category' => 'hearts',
                'tagline' => 'Share kindness across the skies.', 'price_minor' => 1290, 'image_key' => 'service.heart-delivery',
                'rating' => 4.8, 'reviews' => 932, 'popular' => true, 'sort' => 2,
                'description' => 'We deliver hearts to your friends safely and with care. Send a little warmth across the Sky.',
                'inclusions' => [
                    'Hearts delivered safely to your chosen friends',
                    'Works on Global and China servers',
                    'Respects the 72-hour friendship rule for gifting',
                    'Friendly and professional Guardians',
                    'Progress updates (optional)',
                ],
                'schema' => ['options' => array_merge([$serverOpt,
                    ['key' => 'target', 'label' => 'Hearts target', 'type' => 'choice', 'icon' => 'heart', 'required' => true, 'default' => '25', 'choices' => [
                        ['value' => '10', 'label' => '10 hearts', 'price_minor' => 0],
                        ['value' => '25', 'label' => '25 hearts', 'price_minor' => 900],
                        ['value' => '50', 'label' => '50 hearts', 'price_minor' => 2400],
                    ]],
                ], $tail)],
            ],
            [
                'slug' => 'seasonal-care', 'name' => 'Seasonal Care', 'category' => 'seasons',
                'tagline' => 'Unlock new horizons together.', 'price_minor' => 2490, 'image_key' => 'service.seasonal-care',
                'rating' => 4.9, 'reviews' => 764, 'popular' => false, 'sort' => 3,
                'description' => 'Get help with seasonal quests, items and special events. A brighter Sky for every season.',
                'inclusions' => [
                    'Seasonal quest completion',
                    'Seasonal candle and item collection',
                    'Event area participation (when available)',
                    'Friendly and professional Guardians',
                ],
                'schema' => ['options' => array_merge([$serverOpt, $planOpt], $tail)],
            ],
            [
                'slug' => 'sky-companion', 'name' => 'Sky Companion', 'category' => 'companions',
                'tagline' => 'Never travel alone again.', 'price_minor' => 1890, 'image_key' => 'service.sky-companion',
                'rating' => 4.7, 'reviews' => 521, 'popular' => false, 'sort' => 4,
                'description' => 'Friendly companions for quests, exploration and special moments across the skies.',
                'inclusions' => [
                    'A friendly companion for your session',
                    'Quest and exploration help',
                    'Special moments and photos',
                    'Trusted by Sky friends',
                ],
                'schema' => ['options' => array_merge([$serverOpt, $planOpt], $tail)],
            ],
            [
                'slug' => 'winged-light', 'name' => 'Winged Light', 'category' => 'more',
                'tagline' => 'Recover lost Winged Light.', 'price_minor' => 1690, 'image_key' => 'service.winged-light',
                'rating' => 4.8, 'reviews' => 410, 'popular' => false, 'sort' => 5,
                'description' => 'Let us help you shine brighter across the skies by recovering your lost Winged Light.',
                'inclusions' => [
                    'Winged Light recovery across realms',
                    'Wing buffs and light collection',
                    'Friendly and professional Guardians',
                ],
                'schema' => ['options' => array_merge([$serverOpt, $planOpt], $tail)],
            ],
            [
                'slug' => 'spirit-collection', 'name' => 'Spirit Collection', 'category' => 'more',
                'tagline' => 'Collect spirits, emotes and cosmetics.', 'price_minor' => 2290, 'image_key' => 'service.spirit-collection',
                'rating' => 4.9, 'reviews' => 638, 'popular' => false, 'sort' => 6,
                'description' => 'Collect spirits, emotes and cosmetics with ease. Relive beautiful memories.',
                'inclusions' => [
                    'Spirit collection and reliving memories',
                    'Emote and cosmetic unlocks',
                    'Friendly and professional Guardians',
                ],
                'schema' => ['options' => array_merge([$serverOpt, $planOpt], $tail)],
            ],
        ];

        $out = [];
        foreach ($defs as $d) {
            $out[$d['slug']] = Service::updateOrCreate(['slug' => $d['slug']], [
                'name' => $d['name'],
                'tagline' => $d['tagline'],
                'description' => $d['description'],
                'category_id' => $categories[$d['category']]->id,
                'price_minor' => $d['price_minor'],
                'currency' => 'MYR',
                'image_key' => $d['image_key'],
                'rating' => $d['rating'],
                'reviews_count' => $d['reviews'],
                'is_popular' => $d['popular'],
                'is_active' => true,
                'inclusions' => $d['inclusions'],
                'config_schema' => $d['schema'],
                'sort' => $d['sort'],
            ]);
        }

        return $out;
    }

    private function seedUser(): User
    {
        return User::updateOrCreate(['email' => 'luna.dreamer@example.com'], [
            'name' => 'LunaDreamer',
            'display_name' => 'LunaDreamer',
            'password' => Hash::make('password'),
            'avatar_key' => 'avatar.user',
            'language' => 'en',
            'currency' => 'MYR',
            'star_points' => 860,
            'member_since' => Carbon::create(2024, 3, 12),
            'notify_order_updates' => true,
            'notify_promotions' => false,
            'email_verified_at' => now(),
        ]);
    }

    private function seedOrders(User $user, array $services): void
    {
        // DM-1024 — Daily Candle Run, in progress (12/20 candles), Guardian Luna
        $o1 = Order::updateOrCreate(['order_code' => 'DM-1024'], [
            'user_id' => $user->id,
            'service_id' => $services['daily-candle-run']->id,
            'service_name' => 'Daily Candle Run',
            'service_tagline' => 'More candles, more possibilities.',
            'service_image_key' => 'service.daily-candle-run',
            'status' => OrderStatus::InProgress,
            'amount_minor' => 800,
            'currency' => 'MYR',
            'payment_method' => 'dream_wallet',
            'config' => ['server' => 'global', 'plan' => 'one_day', 'target' => '20', 'guardian_pref' => 'any', 'preferred_time' => 'any', 'special_requests' => ''],
            'guardian_name' => 'Luna',
            'guardian_avatar_key' => 'avatar.guardian-luna',
            'guardian_note' => "Let's make the Sky brighter together!",
            'guardian_online' => true,
            'progress_current' => 12,
            'progress_target' => 20,
            'progress_unit' => 'candles',
            'contact_name' => 'DreamySky',
            'placed_at' => Carbon::create(2024, 3, 8, 10, 24),
            'paid_at' => Carbon::create(2024, 3, 8, 10, 24),
            'expected_at' => Carbon::create(2024, 3, 8, 18, 0),
        ]);
        $this->events($o1, [
            ['Payment confirmed', 'Your order has been received. Thank you for your support!', 'done', Carbon::create(2024, 3, 8, 10, 24)],
            ['Guardian assigned', 'Luna has accepted your order. Get ready for a brighter Sky!', 'done', Carbon::create(2024, 3, 8, 10, 31)],
            ['Service started', 'Luna has begun the Daily Candle Run.', 'done', Carbon::create(2024, 3, 8, 10, 45)],
            ['Progress update', '12 / 20 candles collected (60%). Keep shining!', 'current', Carbon::create(2024, 3, 8, 11, 28)],
        ]);

        // DM-1023 — Heart Delivery, awaiting Guardian
        $o2 = Order::updateOrCreate(['order_code' => 'DM-1023'], [
            'user_id' => $user->id,
            'service_id' => $services['heart-delivery']->id,
            'service_name' => 'Heart Delivery',
            'service_tagline' => 'Send a little warmth across the Sky.',
            'service_image_key' => 'service.heart-delivery',
            'status' => OrderStatus::AwaitingGuardian,
            'amount_minor' => 1200,
            'currency' => 'MYR',
            'payment_method' => 'dream_wallet',
            'config' => ['server' => 'global', 'target' => '25', 'guardian_pref' => 'any', 'special_requests' => ''],
            'contact_name' => 'DreamySky',
            'placed_at' => Carbon::create(2024, 3, 7, 18, 15),
            'paid_at' => Carbon::create(2024, 3, 7, 18, 15),
        ]);
        $this->events($o2, [
            ['Payment confirmed', 'Your order has been received. Thank you for your support!', 'done', Carbon::create(2024, 3, 7, 18, 15)],
            ['Finding your Guardian', "We're finding the right Guardian for your order.", 'current', Carbon::create(2024, 3, 7, 18, 15)],
        ]);

        // DM-1018 — Seasonal Care, completed (review not yet left)
        $o3 = Order::updateOrCreate(['order_code' => 'DM-1018'], [
            'user_id' => $user->id,
            'service_id' => $services['seasonal-care']->id,
            'service_name' => 'Seasonal Care',
            'service_tagline' => 'A brighter Sky for every season.',
            'service_image_key' => 'service.seasonal-care',
            'status' => OrderStatus::Completed,
            'amount_minor' => 1500,
            'currency' => 'MYR',
            'payment_method' => 'dream_wallet',
            'config' => ['server' => 'global', 'plan' => 'one_day', 'guardian_pref' => 'any', 'special_requests' => ''],
            'guardian_name' => 'Luna',
            'guardian_avatar_key' => 'avatar.guardian-luna',
            'progress_current' => 1,
            'progress_target' => 1,
            'review_left' => false,
            'contact_name' => 'DreamySky',
            'placed_at' => Carbon::create(2024, 2, 28, 15, 40),
            'paid_at' => Carbon::create(2024, 2, 28, 15, 40),
            'completed_at' => Carbon::create(2024, 2, 28, 20, 10),
        ]);
        $this->events($o3, [
            ['Payment confirmed', 'Your order has been received. Thank you for your support!', 'done', Carbon::create(2024, 2, 28, 15, 40)],
            ['Guardian assigned', 'Luna has accepted your order.', 'done', Carbon::create(2024, 2, 28, 15, 52)],
            ['Service started', 'Luna has begun your Seasonal Care.', 'done', Carbon::create(2024, 2, 28, 16, 10)],
            ['Completed', 'This journey is complete! Thank you for spreading kindness.', 'done', Carbon::create(2024, 2, 28, 20, 10)],
        ]);
    }

    private function events(Order $order, array $rows): void
    {
        $order->events()->delete();
        $sort = 1;
        foreach ($rows as [$label, $desc, $state, $at]) {
            OrderEvent::create([
                'order_id' => $order->id,
                'label' => $label,
                'description' => $desc,
                'state' => $state,
                'happened_at' => $at,
                'sort' => $sort++,
            ]);
        }
    }

    private function seedWallet(User $user): void
    {
        $user->walletTransactions()->delete();

        $rows = [
            // [type, method, description, amount_minor, when]
            [WalletTransactionType::TopUp, 'online_banking', 'Wallet top-up · Welcome credit', 8150, Carbon::create(2024, 2, 20, 9, 0)],
            [WalletTransactionType::Refund, 'dream_wallet', 'Refund · Order DM-1018', 500, Carbon::create(2024, 3, 7, 15, 26)],
            [WalletTransactionType::TopUp, 'online_banking', 'Wallet top-up · Online banking', 5000, Carbon::create(2024, 3, 8, 9, 12)],
            [WalletTransactionType::Payment, 'dream_wallet', 'Candle Run · Order DM-1024', -800, Carbon::create(2024, 3, 8, 10, 45)],
        ];

        foreach ($rows as [$type, $method, $desc, $amount, $when]) {
            WalletTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'method' => $method,
                'description' => $desc,
                'amount_minor' => $amount,
                'currency' => 'MYR',
                'status' => 'completed',
                'created_at' => $when,
                'updated_at' => $when,
            ]);
        }
        // Sum = 8150 + 500 + 5000 - 800 = 12850 sen = RM 128.50
    }

    private function seedPoints(User $user): void
    {
        $user->pointTransactions()->delete();

        $rows = [
            [PointTransactionType::Earn, 500, 'Earned from order DM-1018', Carbon::create(2024, 2, 28, 20, 10)],
            [PointTransactionType::Earn, 360, 'Earned from order DM-1024', Carbon::create(2024, 3, 8, 10, 24)],
        ];

        foreach ($rows as [$type, $points, $desc, $when]) {
            PointTransaction::create([
                'user_id' => $user->id,
                'type' => $type,
                'points' => $points,
                'description' => $desc,
                'expires_at' => $when->copy()->addMonths((int) config('dreammy.points.expiry_months', 12)),
                'created_at' => $when,
                'updated_at' => $when,
            ]);
        }
        // Total = 860, matches star_points on the user.
    }

    private function seedRewards(): void
    {
        $defs = [
            ['RM 5 Service Voucher', 'Use for any service on Dreammy.', 500, 'B', 'reward.voucher-5', 1],
            ['RM 10 Service Voucher', 'Use for any service on Dreammy.', 1000, 'B', 'reward.voucher-10', 2],
            ['Companion Discount', 'Enjoy a special discount when you book a service together with a friend.', 750, 'B', 'reward.companion-discount', 3],
        ];

        foreach ($defs as [$name, $desc, $cost, $band, $image, $sort]) {
            RewardItem::updateOrCreate(['name' => $name], [
                'description' => $desc,
                'points_cost' => $cost,
                'band' => $band,
                'image_key' => $image,
                'is_available' => true,
                'sort' => $sort,
            ]);
        }
    }

    private function seedFavorites(User $user): void
    {
        $user->favorites()->delete();

        Favorite::create(['user_id' => $user->id, 'title' => 'Guardian Luna', 'description' => 'A loyal companion who lights the way.', 'image_key' => 'favorite.guardian-luna', 'sort' => 1]);
        Favorite::create(['user_id' => $user->id, 'title' => 'Candle Run', 'description' => 'A peaceful journey filled with warm lights.', 'image_key' => 'favorite.candle-run', 'sort' => 2]);
    }

    private function seedFaqs(): void
    {
        $defs = [
            ['How is my account handled?', 'We only request the necessary information to provide our services, and access is handled through a secure flow. Please do not share your account credentials (such as your password) with anyone.'],
            ['How do I track my order?', 'Go to My Orders and open any order to see its live status, journey timeline and progress updates.'],
            ['Can I change or cancel my order?', 'While an order is still awaiting a Guardian, contact support and we will help you adjust or cancel it.'],
            ['How do refunds work?', 'If something goes wrong, our team reviews the order and may issue a full, partial or wallet refund depending on the situation.'],
            ['What payment methods are accepted?', 'You can pay with your Dream Wallet, online banking or e-wallet at checkout.'],
            ['How do I keep my account safe?', 'Enable two-step verification, review your active sessions regularly and never share your password.'],
        ];

        $sort = 1;
        foreach ($defs as [$q, $a]) {
            Faq::updateOrCreate(['question' => $q], ['answer' => $a, 'category' => 'general', 'sort' => $sort++]);
        }
    }
}
