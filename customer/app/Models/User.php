<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'display_name',
        'email',
        'password',
        'avatar_key',
        'language',
        'currency',
        'star_points',
        'member_since',
        'notify_order_updates',
        'notify_promotions',
        'discord_id',
    ];

    /**
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'member_since' => 'date',
            'star_points' => 'integer',
            'notify_order_updates' => 'boolean',
            'notify_promotions' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function pointTransactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class);
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    /** Authoritative wallet balance derived from the ledger (completed rows only). */
    public function walletBalanceMinor(): int
    {
        return (int) $this->walletTransactions()
            ->where('status', 'completed')
            ->sum('amount_minor');
    }

    /** Amount currently held for pending withdrawals. Withdrawals are out of MVP scope. */
    public function pendingWithdrawalMinor(): int
    {
        return 0;
    }

    public function displayName(): string
    {
        return $this->display_name ?: $this->name;
    }
}
