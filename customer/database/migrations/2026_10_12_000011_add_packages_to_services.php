<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Optional purchasable packages per service. Each entry is a JSON object:
 *   { key, name, price_minor, price_cny_minor, description }
 * When a service has packages, the customer picks one and its price becomes the
 * unit price (× quantity). Services without packages keep using `price_minor`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->json('packages')->nullable()->after('price_cny_minor');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('packages');
        });
    }
};
