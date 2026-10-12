<?php

declare(strict_types=1);

namespace App\Services;

use App\Support\Currency;
use Illuminate\Support\Str;

/**
 * A lightweight session-backed cart. Each line stores a service, its chosen
 * options, quantity and the currency it was added in. Items check out as
 * separate orders (see Cart Livewire component), so no DB tables are needed.
 */
class CartService
{
    private const KEY = 'cart';

    /** @return array<int,array{id:string,service_id:int,selections:array,quantity:int,currency:string}> */
    public function items(): array
    {
        return array_values(session(self::KEY, []));
    }

    /** Number of distinct lines in the cart (for the header badge). */
    public function count(): int
    {
        return count($this->items());
    }

    public function add(int $serviceId, array $selections, int $quantity, string $currency, ?string $packageKey = null): void
    {
        $items = $this->items();
        $items[] = [
            'id' => (string) Str::uuid(),
            'service_id' => $serviceId,
            'selections' => $selections,
            'quantity' => max(1, min(99, $quantity)),
            'currency' => Currency::isSupported($currency) ? strtoupper($currency) : Currency::MYR,
            'package_key' => $packageKey,
        ];
        session([self::KEY => $items]);
    }

    public function updateQuantity(string $id, int $quantity): void
    {
        $items = array_map(function (array $i) use ($id, $quantity) {
            if ($i['id'] === $id) {
                $i['quantity'] = max(1, min(99, $quantity));
            }

            return $i;
        }, $this->items());
        session([self::KEY => $items]);
    }

    public function remove(string $id): void
    {
        session([self::KEY => array_values(array_filter(
            $this->items(),
            fn (array $i) => $i['id'] !== $id,
        ))]);
    }

    /** @return array{id:string,service_id:int,selections:array,quantity:int,currency:string}|null */
    public function find(string $id): ?array
    {
        foreach ($this->items() as $item) {
            if ($item['id'] === $id) {
                return $item;
            }
        }

        return null;
    }

    public function clear(): void
    {
        session()->forget(self::KEY);
    }
}
