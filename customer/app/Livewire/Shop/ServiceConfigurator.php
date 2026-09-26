<?php

namespace App\Livewire\Shop;

use App\Domain\Pricing\PricingService;
use App\Models\Service;
use App\Services\OrderService;
use Livewire\Component;

class ServiceConfigurator extends Component
{
    public int $serviceId;

    /** @var array<string,mixed> */
    public array $selections = [];

    public function mount(Service $service): void
    {
        $this->serviceId = $service->id;
        $this->selections = app(PricingService::class)->normalise($service->config_schema ?? [], []);
    }

    public function select(string $key, string $value): void
    {
        $this->selections[$key] = $value;
    }

    public function continue(OrderService $orders)
    {
        if (! auth()->check()) {
            session()->flash('status', 'Please log in to place your order.');

            return redirect()->guest(route('login'));
        }

        $service = Service::findOrFail($this->serviceId);
        $order = $orders->createDraft(auth()->user(), $service, $this->selections);

        return redirect()->route('checkout.show', $order);
    }

    public function render()
    {
        $service = Service::findOrFail($this->serviceId);
        $schema = $service->config_schema ?? [];
        $total = app(PricingService::class)->total($schema, $service->price_minor, $this->selections, $service->currency);

        return view('livewire.shop.service-configurator', [
            'service' => $service,
            'schema' => $schema,
            'total' => $total,
        ]);
    }
}
