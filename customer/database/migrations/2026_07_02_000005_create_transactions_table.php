<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Money-movement ledger underlying the admin reports/dashboard aggregates.
 * `amount_minor` is signed: charges positive, refunds/discounts negative.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_code')->nullable();
            $table->string('type')->default('charge');          // charge | refund | discount
            $table->integer('amount_minor')->default(0);        // signed
            $table->string('currency', 3)->default('MYR');
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('occurred_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
