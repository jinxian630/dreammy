<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin-only order columns. The customer app keeps using `status`; the admin
 * tracks payment and fulfillment separately plus a guardian link, internal notes,
 * screenshot URLs and a money breakdown used by the order detail / reports.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_status')->default('pending');      // pending | paid | refunded
            $table->string('fulfillment_status')->default('pending');  // pending | awaiting_guardian | in_progress | completed | cancelled
            $table->foreignId('guardian_id')->nullable()->constrained()->nullOnDelete();
            $table->text('internal_notes')->nullable();
            $table->string('before_screenshot')->nullable();
            $table->string('after_screenshot')->nullable();
            $table->unsignedInteger('subtotal_minor')->default(0);
            $table->unsignedInteger('discount_minor')->default(0);
            $table->unsignedInteger('refund_minor')->default(0);
            $table->unsignedInteger('total_minor')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('guardian_id');
            $table->dropColumn([
                'payment_status', 'fulfillment_status', 'internal_notes',
                'before_screenshot', 'after_screenshot',
                'subtotal_minor', 'discount_minor', 'refund_minor', 'total_minor',
            ]);
        });
    }
};
