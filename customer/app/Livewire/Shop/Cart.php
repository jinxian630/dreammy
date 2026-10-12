<?php

namespace App\Livewire\Shop;

use App\Domain\Pricing\PricingService;
use App\Models\Service;
use App\Services\CartService;
use App\Services\OrderService;
use App\Support\Currency;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Your Cart')]
class Cart extends Component
{
    public function incrementQty(string $id, CartService $cart): void
    {
        if ($item = $cart->find($id)) {
            $cart->updateQuantity($id, $item['quantity'] + 1);
        }
    }

    public function decrementQty(string $id, CartService $cart): void
    {
        if ($item = $cart->find($id)) {
            $cart->updateQuantity($id, $item['quantity'] - 1);
        }
    }

    public function remove(string $id, CartService $cart): void
    {
        $cart->remove($id);
        $this->dispatch('cart-updated', count: $cart->count());
    }

    public function clear(CartService $cart): void
    {
        $cart->clear();
        $this->dispatch('cart-updated', count: 0);
    }

    /** Turn one cart line into a draft order and send the customer to checkout. */
    public function checkoutItem(string $id, CartService $cart, OrderService $orders)
    {
        if (! auth()->check()) {
            session()->flash('status', 'Please log in to check out.');

            return redirect()->guest(route('login'));
        }

        $item = $cart->find($id);
        if (! $item) {
            return null;
        }

        $service = Service::find($item['service_id']);
        if (! $service) {
            $cart->remove($id);

            return null;
        }

        $order = $orders->createDraft(auth()->user(), $service, $item['selections'], $item['currency'], $item['quantity'], $item['package_key'] ?? null);
        $cart->remove($id);
        $this->dispatch('cart-updated', count: $cart->count());

        return redirect()->route('checkout.show', $order);
    }

    public function render()
    {
        $cart = app(CartService::class);
        $pricing = app(PricingService::class);

        $rows = [];
        $subtotals = [];
        foreach ($cart->items() as $item) {
            $service = Service::find($item['service_id']);
            if (! $service) {
                continue;
            }
            $currency = $item['currency'];
            $packageKey = $item['package_key'] ?? null;
            $base = Currency::unitPriceMinor($service, $packageKey, $currency)
                ?? Currency::priceMinorFor($service, $currency)
                ?? $service->price_minor;
            $line = $pricing->total($service->config_schema ?? [], $base, $item['selections'], $currency)
                ->times($item['quantity']);
            $subtotals[$currency] = ($subtotals[$currency] ?? 0) + $line->minor;

            $package = $service->findPackage($packageKey);

            $rows[] = [
                'id' => $item['id'],
                'service' => $service,
                'quantity' => $item['quantity'],
                'packageName' => $package['name'] ?? null,
                'lineFormatted' => $line->format(Currency::symbol($currency)),
            ];
        }

        $subtotalLabels = [];
        foreach ($subtotals as $cur => $minor) {
            $subtotalLabels[] = Currency::symbol($cur).' '.number_format($minor / 100, 2);
        }

        return view('livewire.shop.cart', [
            'rows' => $rows,
            'subtotalLabels' => $subtotalLabels,
        ]);
    }
}
