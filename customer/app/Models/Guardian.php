<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Guardian extends Model
{
    protected $fillable = [
        'name', 'avatar_key', 'online', 'active_orders', 'joined_at',
    ];

    protected $casts = [
        'online' => 'boolean',
        'active_orders' => 'integer',
        'joined_at' => 'datetime',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
