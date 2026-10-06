<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Staff task-assignment for orders. Distinct from the guardian (external
 * fulfiller) link: this records which internal team member is responsible for
 * an order, who assigned them, and when. IDs are Supabase auth user ids
 * (team_members.user_id); emails are snapshots kept for display.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('assigned_staff_id')->nullable();     // team_members.user_id
            $table->string('assigned_staff_email')->nullable();  // snapshot for display
            $table->string('assigned_by_id')->nullable();        // who performed the assignment
            $table->string('assigned_by_email')->nullable();     // snapshot for display
            $table->timestamp('assigned_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'assigned_staff_id', 'assigned_staff_email',
                'assigned_by_id', 'assigned_by_email', 'assigned_at',
            ]);
        });
    }
};
