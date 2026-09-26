<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type');                     // topup | payment | refund | adjustment
            $table->string('method')->nullable();       // dream_wallet | online_banking | ewallet
            $table->string('description');
            $table->integer('amount_minor');            // signed: credits +, debits -
            $table->string('currency', 3)->default('MYR');
            $table->string('status')->default('completed'); // completed | pending
            $table->string('reference')->nullable();
            $table->timestamps();

            // Idempotency: at most one payment (and one refund) per order.
            // NULL order_id (top-ups) are distinct, so multiple top-ups are allowed.
            $table->unique(['order_id', 'type']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
