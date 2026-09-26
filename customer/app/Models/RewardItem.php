<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RewardItem extends Model
{
    protected $fillable = [
        'name', 'description', 'points_cost', 'band', 'image_key', 'is_available', 'sort',
    ];

    protected $casts = [
        'points_cost' => 'integer',
        'is_available' => 'boolean',
    ];

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
