<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A reward item can grant a specific service for free. The admin creates these
 * "free-service vouchers"; customers redeem them with points in the Rewards Center.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reward_items', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('reward_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('service_id');
        });
    }
};
