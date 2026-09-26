<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Service extends Model
{
    protected $fillable = [
        'slug', 'name', 'tagline', 'description', 'category_id', 'price_minor',
        'currency', 'image_key', 'rating', 'reviews_count', 'is_popular',
        'is_active', 'inclusions', 'config_schema', 'sort',
    ];

    protected $casts = [
        'price_minor' => 'integer',
        'reviews_count' => 'integer',
        'rating' => 'float',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'inclusions' => 'array',
        'config_schema' => 'array',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
