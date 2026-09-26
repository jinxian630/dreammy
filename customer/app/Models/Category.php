<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = ['name', 'slug', 'sort'];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
