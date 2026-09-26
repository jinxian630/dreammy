<?php

namespace App\Models;

use App\Enums\PointTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointTransaction extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'reward_item_id', 'type', 'points', 'description', 'expires_at',
    ];

    protected $casts = [
        'type' => PointTransactionType::class,
        'points' => 'integer',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(RewardItem::class, 'reward_item_id');
    }
}
