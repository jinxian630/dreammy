<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('display_name')->nullable()->after('name');
            $table->string('avatar_key')->nullable()->after('display_name');
            $table->string('language', 20)->default('en')->after('avatar_key');
            $table->string('currency', 3)->default('MYR')->after('language');
            $table->unsignedBigInteger('star_points')->default(0)->after('currency');
            $table->date('member_since')->nullable()->after('star_points');
            $table->boolean('notify_order_updates')->default(true)->after('member_since');
            $table->boolean('notify_promotions')->default(false)->after('notify_order_updates');
            $table->string('discord_id')->nullable()->unique()->after('notify_promotions');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'display_name', 'avatar_key', 'language', 'currency', 'star_points',
                'member_since', 'notify_order_updates', 'notify_promotions', 'discord_id',
            ]);
        });
    }
};
