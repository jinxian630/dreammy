<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('order_code')->unique();
            $table->foreignId('service_id')->nullable()->constrained()->nullOnDelete();
            $table->string('service_name');            // snapshot at order time
            $table->string('service_tagline')->nullable();
            $table->string('service_image_key')->nullable();
            $table->string('status')->default('draft');
            $table->unsignedInteger('amount_minor')->default(0);
            $table->string('currency', 3)->default('MYR');
            $table->string('payment_method')->nullable();
            $table->json('config')->nullable();        // selections snapshot
            $table->string('guardian_name')->nullable();
            $table->string('guardian_avatar_key')->nullable();
            $table->string('guardian_note')->nullable();
            $table->boolean('guardian_online')->default(false);
            $table->unsignedInteger('progress_current')->default(0);
            $table->unsignedInteger('progress_target')->default(0);
            $table->string('progress_unit')->nullable();
            $table->string('contact_name')->nullable();
            $table->boolean('is_repurchase')->default(false);
            $table->boolean('review_left')->default(false);
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::create('order_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('label');
            $table->text('description')->nullable();
            $table->string('state')->default('pending'); // done | current | pending
            $table->timestamp('happened_at')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_events');
        Schema::dropIfExists('orders');
    }
};
