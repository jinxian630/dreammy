<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drops the discount-voucher table. Vouchers are now "free-service rewards"
 * stored in `reward_items` and redeemed with points. `down()` recreates the
 * original structure from 2026_07_02_000002 for reversibility.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('vouchers');
    }

    public function down(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('internal_name');
            $table->string('discount_type')->default('fixed');
            $table->unsignedInteger('value_minor')->nullable();
            $table->unsignedInteger('percent')->nullable();
            $table->string('currency', 3)->default('MYR');
            $table->unsignedInteger('min_spend_minor')->default(0);
            $table->unsignedInteger('max_discount_minor')->nullable();
            $table->json('eligible_service_ids')->nullable();
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->unsignedInteger('total_limit')->default(0);
            $table->unsignedInteger('per_customer_limit')->default(0);
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }
};
