<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientFundsException;
use App\Exceptions\InsufficientPointsException;
use App\Models\Order;
use App\Models\RewardItem;
use App\Models\Service;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\OrderService;
use App\Services\PaymentService;
use App\Services\PointsService;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrderFlowTest extends TestCase
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

    public function test_guest_is_redirected_from_protected_pages(): void
    {
        $this->get('/orders')->assertRedirect(route('login'));
        $this->get('/wallet')->assertRedirect(route('login'));
        $this->get('/rewards')->assertRedirect(route('login'));
        $this->get('/profile')->assertRedirect(route('login'));
    }

    public function test_public_pages_render(): void
    {
        $this->get('/')->assertOk();
        $this->get('/services')->assertOk();
        $this->get('/services/daily-candle-run')->assertOk();
    }

    public function test_authed_account_pages_render(): void
    {
        $user = $this->demoUser();
        $order = Order::where('order_code', 'DM-1024')->firstOrFail();

        $this->actingAs($user)->get('/orders')->assertOk();
        $this->actingAs($user)->get('/wallet')->assertOk();
        $this->actingAs($user)->get('/rewards')->assertOk();
        $this->actingAs($user)->get('/profile')->assertOk();
        $this->actingAs($user)->get(route('orders.show', $order))->assertOk();
        $this->actingAs($user)->get(route('orders.confirmed', $order))->assertOk();
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        $intruder = User::factory()->create();
        $order = Order::where('order_code', 'DM-1024')->firstOrFail();

        $this->actingAs($intruder)->get(route('orders.show', $order))->assertForbidden();
    }

    public function test_draft_creation_uses_server_authoritative_pricing(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();

        $order = app(OrderService::class)->createDraft($user, $service, [
            'server' => 'global', 'plan' => 'seven_days', 'target' => '20', 'guardian_pref' => 'choose',
            // A malicious client-sent price is irrelevant — pricing is computed server-side.
            'amount_minor' => 1,
        ]);

        // base 890 + seven_days 4900 + choose 300 = 6090
        $this->assertSame(6090, $order->amount_minor);
        $this->assertSame(OrderStatus::Draft, $order->status);
    }

    public function test_wallet_payment_debits_once_and_is_idempotent(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();
        $order = app(OrderService::class)->createDraft($user, $service, ['server' => 'global', 'plan' => 'one_day', 'target' => '15', 'guardian_pref' => 'any']);

        $before = $user->walletBalanceMinor();
        $payments = app(PaymentService::class);

        $payments->pay($order, PaymentService::METHOD_WALLET);
        $payments->pay($order->fresh(), PaymentService::METHOD_WALLET); // second call = no-op

        $this->assertSame($before - $order->amount_minor, $user->fresh()->walletBalanceMinor());
        $this->assertSame(1, WalletTransaction::where('order_id', $order->id)->where('type', 'payment')->count());
        $this->assertSame(OrderStatus::AwaitingGuardian, $order->fresh()->status);
    }

    public function test_wallet_payment_rejects_insufficient_funds(): void
    {
        $user = User::factory()->create(['currency' => 'MYR']);
        $service = Service::where('slug', 'seasonal-care')->firstOrFail();
        $order = app(OrderService::class)->createDraft($user, $service, ['server' => 'global', 'plan' => 'one_day', 'guardian_pref' => 'any']);

        $this->expectException(InsufficientFundsException::class);
        app(PaymentService::class)->pay($order, PaymentService::METHOD_WALLET);
    }

    public function test_paying_awards_points(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();
        $order = app(OrderService::class)->createDraft($user, $service, ['server' => 'global', 'plan' => 'one_day', 'target' => '15', 'guardian_pref' => 'any']);

        $pointsBefore = $user->star_points;
        app(PaymentService::class)->pay($order, PaymentService::METHOD_WALLET);

        // 1 sen = 1 point → amount_minor points awarded
        $this->assertSame($pointsBefore + $order->amount_minor, $user->fresh()->star_points);
    }

    public function test_points_redemption_requires_enough_balance(): void
    {
        $points = app(PointsService::class);
        $poorUser = User::factory()->create(['star_points' => 100]);
        $reward = RewardItem::where('points_cost', 500)->firstOrFail();

        $this->expectException(InsufficientPointsException::class);
        $points->redeem($poorUser, $reward);
    }

    public function test_points_redemption_deducts_points(): void
    {
        $points = app(PointsService::class);
        $user = $this->demoUser();
        $reward = RewardItem::where('points_cost', 500)->firstOrFail();

        $before = $user->star_points;
        $points->redeem($user, $reward);

        $this->assertSame($before - 500, $user->fresh()->star_points);
    }
}
