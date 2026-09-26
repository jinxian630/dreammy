<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'order_code', 'service_id', 'service_name', 'service_tagline',
        'service_image_key', 'status', 'amount_minor', 'currency', 'payment_method',
        'config', 'guardian_name', 'guardian_avatar_key', 'guardian_note', 'guardian_online',
        'progress_current', 'progress_target', 'progress_unit', 'contact_name',
        'is_repurchase', 'review_left', 'placed_at', 'paid_at', 'expected_at', 'completed_at',
    ];

    protected $casts = [
        'status' => OrderStatus::class,
        'amount_minor' => 'integer',
        'config' => 'array',
        'guardian_online' => 'boolean',
        'is_repurchase' => 'boolean',
        'review_left' => 'boolean',
        'progress_current' => 'integer',
        'progress_target' => 'integer',
        'placed_at' => 'datetime',
        'paid_at' => 'datetime',
        'expected_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(OrderEvent::class)->orderBy('sort')->orderBy('happened_at');
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function getRouteKeyName(): string
    {
        return 'order_code';
    }

    public function progressPercent(): int
    {
        if ($this->progress_target <= 0) {
            return $this->status === OrderStatus::Completed ? 100 : 0;
        }

        return (int) min(100, round($this->progress_current / $this->progress_target * 100));
    }

    /**
     * Human-readable summary of the order configuration, for review screens.
     *
     * @return array<int,array{label:string,value:string,icon:string}>
     */
    public function configSummary(): array
    {
        $config = $this->config ?? [];
        $schema = $this->service?->config_schema ?? [];
        $pricing = app(\App\Domain\Pricing\PricingService::class);

        $iconFor = [
            'server' => 'globe', 'plan' => 'calendar', 'target' => 'tag',
            'guardian_pref' => 'users', 'preferred_time' => 'clock',
        ];

        $rows = [];
        foreach ($schema['options'] ?? [] as $option) {
            $key = $option['key'] ?? null;
            $type = $option['type'] ?? 'text';
            if (! $key || $key === 'special_requests' || ! in_array($type, ['choice', 'select'], true)) {
                continue;
            }
            $value = $config[$key] ?? null;
            if ($value === null || $value === '') {
                continue;
            }
            $rows[] = [
                'label' => $option['label'] ?? ucfirst($key),
                'value' => $pricing->choiceLabel($schema, $key, $value) ?? (string) $value,
                'icon' => $option['icon'] ?? $iconFor[$key] ?? 'sparkle',
            ];
        }

        $rows[] = ['label' => 'Traveller (Contact)', 'value' => $this->contact_name ?: '—', 'icon' => 'profile'];

        $notes = trim((string) ($config['special_requests'] ?? ''));
        $rows[] = ['label' => 'Order notes (optional)', 'value' => $notes !== '' ? $notes : 'No additional notes', 'icon' => 'edit'];

        return $rows;
    }
}
