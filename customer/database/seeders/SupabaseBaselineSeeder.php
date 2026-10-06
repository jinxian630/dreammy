<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Guardian;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/**
 * Minimal, production-safe baseline for the shared Supabase database.
 *
 * Seeds ONLY the category taxonomy (slugs must match the admin app's
 * ServiceCategory enum) and a few Guardians so the admin can assign orders.
 * It intentionally does NOT seed demo services/orders — those are created by
 * the admin app. Safe to re-run (uses updateOrCreate).
 *
 *   php artisan db:seed --class=SupabaseBaselineSeeder
 */
class SupabaseBaselineSeeder extends Seeder
{
    public function run(): void
    {
        // Slugs MUST match admin `ServiceCategory` (src/types/service.ts).
        $categories = [
            'candle-runs' => 'Candle Runs',
            'hearts' => 'Hearts',
            'seasonal' => 'Seasonal',
            'companions' => 'Companions',
            'other' => 'Other',
        ];

        $sort = 1;
        foreach ($categories as $slug => $name) {
            Category::updateOrCreate(['slug' => $slug], ['name' => $name, 'sort' => $sort++]);
        }

        $guardians = [
            ['name' => 'Luna', 'avatar_key' => 'avatar.guardian-luna'],
            ['name' => 'Nova', 'avatar_key' => 'avatar.guardian-nova'],
            ['name' => 'Aurora', 'avatar_key' => 'avatar.guardian-aurora'],
            ['name' => 'Lumi', 'avatar_key' => 'avatar.guardian-lumi'],
        ];

        foreach ($guardians as $g) {
            Guardian::updateOrCreate(
                ['name' => $g['name']],
                [
                    'avatar_key' => $g['avatar_key'],
                    'online' => true,
                    'active_orders' => 0,
                    'joined_at' => Carbon::now(),
                ],
            );
        }
    }
}
