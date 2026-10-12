<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    protected $fillable = [
        'slug', 'name', 'tagline', 'description', 'category_id', 'price_minor',
        'currency', 'price_cny_minor', 'packages', 'image_key', 'rating', 'reviews_count', 'is_popular',
        'is_active', 'inclusions', 'config_schema', 'sort',
        // Admin-managed fields (see 2026_07_02_000001 migration)
        'status', 'server', 'duration', 'options', 'preferred_time',
        'estimated_completion', 'customer_instructions', 'orders_count',
    ];

    protected $casts = [
        'price_minor' => 'integer',
        'price_cny_minor' => 'integer',
        'packages' => 'array',
        'reviews_count' => 'integer',
        'rating' => 'float',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'inclusions' => 'array',
        'config_schema' => 'array',
        'options' => 'array',
        'orders_count' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    /** @return array<int,array{key:string,name:string,price_minor:int,price_cny_minor:?int,description:?string}> */
    public function packageList(): array
    {
        return is_array($this->packages) ? array_values($this->packages) : [];
    }

    public function hasPackages(): bool
    {
        return count($this->packageList()) > 0;
    }

    /** Find a package by key, falling back to the first one. Null if none exist. */
    public function findPackage(?string $key): ?array
    {
        $packages = $this->packageList();
        if (! $packages) {
            return null;
        }
        foreach ($packages as $p) {
            if (($p['key'] ?? null) === $key) {
                return $p;
            }
        }

        return $packages[0];
    }
}
