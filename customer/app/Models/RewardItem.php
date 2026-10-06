<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardItem extends Model
{
    protected $fillable = [
        'name', 'description', 'points_cost', 'band', 'image_key', 'is_available', 'sort', 'service_id',
    ];

    protected $casts = [
        'points_cost' => 'integer',
        'is_available' => 'boolean',
    ];

    /** The service granted for free when this reward is redeemed (optional). */
    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function bandLabel(): string
    {
        return match ($this->band) {
            'A' => 'Status',
            'B' => 'Margin',
            'C' => 'Cash',
            default => 'Reward',
        };
    }
}
