<?php

declare(strict_types=1);

namespace App\Services;

use App\Domain\Pricing\PricingService;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Support\Currency;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(private readonly PricingService $pricing) {}

    /**
     * Create (or replace) a DRAFT order for a service with server-computed pricing.
     *
     * @param  array<string,mixed>  $selections
     */
    public function createDraft(User $user, Service $service, array $selections, ?string $currency = null, int $quantity = 1, ?string $packageKey = null): Order
    {
        // The chosen display currency locks onto the order. The unit price honours
        // the selected package when the service has packages, else the base price.
        $currency = $currency ? strtoupper($currency) : Currency::MYR;
        $basePrice = Currency::unitPriceMinor($service, $packageKey, $currency);
        if ($basePrice === null) {
            // No price in the requested currency → fall back to MYR.
            $currency = Currency::MYR;
            $basePrice = Currency::unitPriceMinor($service, $packageKey, $currency) ?? $service->price_minor;
        }

        $qty = max(1, min(99, $quantity));
        $schema = $service->config_schema ?? [];
        $clean = $this->pricing->normalise($schema, $selections);
        $clean['quantity'] = $qty; // recorded for the order summary
        if ($package = $service->findPackage($packageKey)) {
            $clean['package'] = $package['name'] ?? null;
        }
        $total = $this->pricing->total($schema, $basePrice, $clean, $currency)->times($qty);

        $isRepurchase = $user->orders()
            ->where('service_id', $service->id)
            ->whereIn('status', ['awaiting_guardian', 'in_progress', 'completed'])
            ->exists();

        return DB::transaction(function () use ($user, $service, $clean, $total, $currency, $isRepurchase) {
            $order = new Order([
                'order_code' => $this->allocateCode($isRepurchase),
                'service_id' => $service->id,
                'service_name' => $service->name,
                'service_tagline' => $service->tagline,
                'service_image_key' => $service->image_key,
                'status' => \App\Enums\OrderStatus::Draft,
                'amount_minor' => $total->minor,
                'currency' => $currency,
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
