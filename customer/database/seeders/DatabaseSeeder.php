<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Development seed data (demo traveller, catalogue, sample orders, wallet, rewards).
        // Clearly separated from production — do not run DemoSeeder in production.
        $this->call(DemoSeeder::class);
    }
}
