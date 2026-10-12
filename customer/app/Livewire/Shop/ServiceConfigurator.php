<?php

namespace App\Livewire\Shop;

use App\Domain\Pricing\PricingService;
use App\Models\Service;
use App\Services\CartService;
use App\Services\OrderService;
use App\Support\Currency;
use Livewire\Component;

class ServiceConfigurator extends Component
{
    public int $serviceId;

    /** @var array<string,mixed> */
    public array $selections = [];

    public int $quantity = 1;

    /** Selected package key (when the service offers packages). */
    public ?string $packageKey = null;

    /** Shows the "added to cart" confirmation until the selection changes. */
    public bool $justAdded = false;

    public function mount(Service $service): void
    {
        $this->serviceId = $service->id;
        $this->selections = app(PricingService::class)->normalise($service->config_schema ?? [], []);
        $this->packageKey = $service->packageList()[0]['key'] ?? null;
    }

    public function select(string $key, string $value): void
    {
        $this->selections[$key] = $value;
        $this->justAdded = false;
    }

    public function selectPackage(string $key): void
    {
        $this->packageKey = $key;
        $this->justAdded = false;
    }

    public function incrementQty(): void
    {
        $this->quantity = min(99, $this->quantity + 1);
        $this->justAdded = false;
    }

    public function decrementQty(): void
    {
        $this->quantity = max(1, $this->quantity - 1);
        $this->justAdded = false;
    }

    /** Keep a typed quantity within 1–99 (empty / invalid input falls back to 1). */
    public function updatedQuantity(mixed $value): void
    {
        $this->quantity = max(1, min(99, (int) $value));
        $this->justAdded = false;
    }

    /** Add the configured item to the session cart and stay on the page. */
    public function addToCart(CartService $cart)
    {
        $service = Service::findOrFail($this->serviceId);
        $currency = Currency::current();

        if (Currency::unitPriceMinor($service, $this->packageKey, $currency) === null) {
            session()->flash('status', 'This isn’t sold in ¥. Switch to RM to add it.');

            return;
        }

        $cart->add($service->id, $this->selections, $this->quantity, $currency, $this->packageKey);
        $this->justAdded = true;
        $this->dispatch('cart-updated', count: $cart->count());
    }

    public function continue(OrderService $orders)
    {
        if (! auth()->check()) {
            session()->flash('status', 'Please log in to place your order.');

            return redirect()->guest(route('login'));
        }

        $service = Service::findOrFail($this->serviceId);
        $currency = Currency::current();

        // No price in the chosen currency (service or package) → can't order in it.
        if (Currency::unitPriceMinor($service, $this->packageKey, $currency) === null) {
            session()->flash('status', 'This isn’t sold in ¥. Switch to RM to order.');

            return null;
        }

        $order = $orders->createDraft(auth()->user(), $service, $this->selections, $currency, $this->quantity, $this->packageKey);

        return redirect()->route('checkout.show', $order);
    }

    public function render()
    {
        $service = Service::findOrFail($this->serviceId);
        $schema = $service->config_schema ?? [];
        $currency = Currency::current();
        $basePrice = Currency::unitPriceMinor($service, $this->packageKey, $currency);
        $available = $basePrice !== null;

        $total = $available
            ? app(PricingService::class)->total($schema, $basePrice, $this->selections, $currency)->times(max(1, $this->quantity))
            : null;

        return view('livewire.shop.service-configurator', [
            'service' => $service,
            'schema' => $schema,
            'packages' => $service->packageList(),
            'total' => $total,
            'available' => $available,
            'symbol' => Currency::symbol($currency),
        ]);
    }
}
