<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discount vouchers managed by the admin. Lifecycle status (active / scheduled /
 * expired / disabled) is derived from `active` + the validity window at read time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vouchers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('internal_name');
            $table->string('discount_type')->default('fixed');   // fixed | percentage
            $table->unsignedInteger('value_minor')->nullable();  // when fixed
            $table->unsignedInteger('percent')->nullable();      // when percentage
            $table->string('currency', 3)->default('MYR');
            $table->unsignedInteger('min_spend_minor')->default(0);
            $table->unsignedInteger('max_discount_minor')->nullable();
            $table->json('eligible_service_ids')->nullable();    // empty/null = all services
            $table->timestamp('start_at')->nullable();
            $table->timestamp('end_at')->nullable();
            $table->unsignedInteger('total_limit')->default(0);
            $table->unsignedInteger('per_customer_limit')->default(0);
            $table->unsignedInteger('used_count')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vouchers');
    }
};
