<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Admin team members for the Next.js admin app's RBAC. These are Supabase Auth
 * users (auth.users), tracked here by their auth UUID. Separate from the
 * customer `users` table. No cross-schema FK to auth.users (kept loose).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('team_members', function (Blueprint $table) {
            $table->id();
            $table->uuid('user_id')->nullable()->unique(); // auth.users.id, set on accept
            $table->string('email')->unique();
            $table->string('role')->default('viewer');     // owner | admin | viewer
            $table->string('status')->default('invited');  // invited | active
            $table->uuid('invited_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_members');
    }
};
