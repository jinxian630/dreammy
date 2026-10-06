<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-only columns added to `services` so the Next.js admin app can manage the
 * full service record. The customer catalogue keeps using `is_active`; the admin
 * adapter keeps `is_active` in sync with `status` (is_active = status === 'active').
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->string('status')->default('active');        // active | draft | archived
            $table->string('server')->default('global');        // global | china
            $table->string('duration')->default('1d');          // 1d | 7d | 30d
            $table->json('options')->nullable();                // admin ServiceOption[]
            $table->string('preferred_time')->nullable();
            $table->string('estimated_completion')->nullable();
            $table->text('customer_instructions')->nullable();
            $table->unsignedInteger('orders_count')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'status', 'server', 'duration', 'options', 'preferred_time',
                'estimated_completion', 'customer_instructions', 'orders_count',
            ]);
        });
    }
};
