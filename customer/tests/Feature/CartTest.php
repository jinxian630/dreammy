<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Livewire\Shop\Cart;
use App\Livewire\Shop\ServiceConfigurator;
use App\Models\Order;
use App\Models\Service;
use App\Models\User;
use App\Services\CartService;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DemoSeeder::class);
    }

    private function demoUser(): User
    {
        return User::where('email', 'luna.dreamer@example.com')->firstOrFail();
    }

    public function test_add_to_cart_adds_a_line_and_confirms(): void
    {
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();

        Livewire::actingAs($this->demoUser())
            ->test(ServiceConfigurator::class, ['service' => $service])
            ->set('quantity', 3)
            ->call('addToCart')
            ->assertSet('justAdded', true)
            ->assertDispatched('cart-updated');

        $cart = app(CartService::class);
        $this->assertSame(1, $cart->count());
        $this->assertSame(3, $cart->items()[0]['quantity']);
    }

    public function test_cart_checkout_creates_a_draft_order_and_removes_the_line(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();

        $cart = app(CartService::class);
        $cart->add($service->id, ['server' => 'global', 'plan' => 'one_day', 'target' => '15', 'guardian_pref' => 'any'], 2, 'MYR');
        $id = $cart->items()[0]['id'];

        Livewire::actingAs($user)
            ->test(Cart::class)
            ->call('checkoutItem', $id)
            ->assertRedirect();

        $this->assertSame(0, app(CartService::class)->count());

        $order = Order::where('user_id', $user->id)->where('status', OrderStatus::Draft)->latest('id')->firstOrFail();
        // base 890 + one_day 0 + any 0 = 890, × 2 = 1780
        $this->assertSame(1780, $order->amount_minor);
        $this->assertSame(2, (int) ($order->config['quantity'] ?? 1));
    }

    public function test_cart_quantity_update_and_remove(): void
    {
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();
        $cart = app(CartService::class);
        $cart->add($service->id, ['server' => 'global', 'plan' => 'one_day', 'guardian_pref' => 'any'], 1, 'MYR');
        $id = $cart->items()[0]['id'];

        $component = Livewire::actingAs($this->demoUser())->test(Cart::class);
        $component->call('incrementQty', $id);
        $this->assertSame(2, app(CartService::class)->items()[0]['quantity']);

        $component->call('remove', $id)->assertDispatched('cart-updated');
        $this->assertSame(0, app(CartService::class)->count());
    }
}
