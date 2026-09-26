<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('price_minor')->default(0);   // minor units (sen)
            $table->string('currency', 3)->default('MYR');
            $table->string('image_key')->nullable();
            $table->decimal('rating', 2, 1)->default(0);          // display only
            $table->unsignedInteger('reviews_count')->default(0); // display only
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('inclusions')->nullable();
            $table->json('config_schema')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('services');
        Schema::dropIfExists('categories');
    }
};
