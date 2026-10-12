<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Second (China) price per service. `price_minor` stays the Malaysia (MYR) price;
 * `price_cny_minor` is the optional China (CNY) price in integer minor units (fen).
 * Null means the service has no China price set and can't be ordered in CNY.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->unsignedInteger('price_cny_minor')->nullable()->after('currency');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('price_cny_minor');
        });
    }
};
