<?php

namespace Tests\Feature;

use App\Livewire\Shop\ServiceConfigurator;
use App\Models\Service;
use App\Models\User;
use App\Services\OrderService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class PackageTest extends TestCase
{
    use RefreshDatabase;

    private function packagedService(): Service
    {
        return Service::create([
            'slug' => 'pkg-service',
            'name' => 'Packaged Service',
            'price_minor' => 100,
            'currency' => 'MYR',
            'is_active' => true,
            'status' => 'active',
            'packages' => [
                ['key' => 'basic', 'name' => 'Basic', 'price_minor' => 500, 'price_cny_minor' => 800, 'description' => ''],
                ['key' => 'pro', 'name' => 'Pro', 'price_minor' => 1500, 'price_cny_minor' => null, 'description' => 'Fastest'],
            ],
        ]);
    }

    public function test_order_uses_selected_package_price_times_quantity(): void
    {
        $user = User::factory()->create();
        $service = $this->packagedService();

        $order = app(OrderService::class)->createDraft($user, $service, [], 'MYR', 2, 'pro');

        $this->assertSame(3000, $order->amount_minor); // 1500 × 2
        $this->assertSame('Pro', $order->config['package']);
        $this->assertSame('MYR', $order->currency);
    }

    public function test_package_cny_price_is_used_when_available(): void
    {
        $user = User::factory()->create();
        $service = $this->packagedService();

        $order = app(OrderService::class)->createDraft($user, $service, [], 'CNY', 1, 'basic');

        $this->assertSame('CNY', $order->currency);
        $this->assertSame(800, $order->amount_minor);
    }

    public function test_package_without_cny_falls_back_to_myr(): void
    {
        $user = User::factory()->create();
        $service = $this->packagedService();

        // "pro" has no ¥ price → should fall back to its RM price in MYR.
        $order = app(OrderService::class)->createDraft($user, $service, [], 'CNY', 1, 'pro');

        $this->assertSame('MYR', $order->currency);
        $this->assertSame(1500, $order->amount_minor);
    }

    public function test_configurator_defaults_to_first_package(): void
    {
        $service = $this->packagedService();

        Livewire::actingAs(User::factory()->create())
            ->test(ServiceConfigurator::class, ['service' => $service])
            ->assertSet('packageKey', 'basic')
            ->call('selectPackage', 'pro')
            ->assertSet('packageKey', 'pro');
    }
}
