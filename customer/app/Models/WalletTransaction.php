<?php

namespace App\Models;

use App\Enums\WalletTransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'user_id', 'order_id', 'type', 'method', 'description',
        'amount_minor', 'currency', 'status', 'reference',
    ];

    protected $casts = [
        'type' => WalletTransactionType::class,
        'amount_minor' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function isCredit(): bool
    {
        return $this->amount_minor >= 0;
    }
}
