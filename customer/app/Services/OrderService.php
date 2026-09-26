<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Pricing\PricingService;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private readonly PricingService $pricing) {}

    /**
     * Create (or replace) a DRAFT order for a service with server-computed pricing.
     *
     * @param  array<string,mixed>  $selections
     */
    public function createDraft(User $user, Service $service, array $selections): Order
    {
        $schema = $service->config_schema ?? [];
        $clean = $this->pricing->normalise($schema, $selections);
        $total = $this->pricing->total($schema, $service->price_minor, $clean, $service->currency);

        $isRepurchase = $user->orders()
            ->where('service_id', $service->id)
            ->whereIn('status', ['awaiting_guardian', 'in_progress', 'completed'])
            ->exists();

        return DB::transaction(function () use ($user, $service, $clean, $total, $isRepurchase) {
            $order = new Order([
                'order_code' => $this->allocateCode($isRepurchase),
                'service_id' => $service->id,
                'service_name' => $service->name,
                'service_tagline' => $service->tagline,
                'service_image_key' => $service->image_key,
                'status' => \App\Enums\OrderStatus::Draft,
                'amount_minor' => $total->minor,
                'currency' => $service->currency,
                'config' => $clean,
                'contact_name' => $user->displayName(),
                'progress_target' => (int) ($clean['target'] ?? 0),
                'progress_unit' => $this->unitFor($service),
                'is_repurchase' => $isRepurchase,
                'placed_at' => now(),
            ]);
            $order->user_id = $user->id;
            $order->save();

            return $order;
        });
    }

    private function allocateCode(bool $isRepurchase): string
    {
        // DM-#### sequential; -R suffix flags a repurchase (cheap retention metric).
        $last = Order::query()->orderByDesc('id')->value('order_code');
        $n = 1000;
        if ($last && preg_match('/DM-(\d+)/', $last, $m)) {
            $n = (int) $m[1] + 1;
        }

        return 'DM-'.$n.($isRepurchase ? '-R' : '');
    }

    private function unitFor(Service $service): ?string
    {
        return match ($service->slug) {
            'daily-candle-run' => 'candles',
            'heart-delivery' => 'hearts',
            default => null,
        };
    }
}
