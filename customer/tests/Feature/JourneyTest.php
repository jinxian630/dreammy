<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Livewire\Account\ProfileSettings;
use App\Livewire\Account\RewardsCenter;
use App\Livewire\Account\WalletManager;
use App\Livewire\Shop\Checkout;
use App\Livewire\Shop\ServiceConfigurator;
use App\Livewire\Support\ContactForm;
use App\Models\Order;
use App\Models\RewardItem;
use App\Models\Service;
use App\Models\User;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class JourneyTest extends TestCase
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

    public function test_full_browse_to_confirmation_journey(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'daily-candle-run')->firstOrFail();

        // Configure → continue → creates draft, redirects to checkout
        Livewire::actingAs($user)->test(ServiceConfigurator::class, ['service' => $service])
            ->call('select', 'plan', 'one_day')
            ->call('continue')
            ->assertRedirect();

        $draft = Order::where('user_id', $user->id)->where('status', OrderStatus::Draft)->latest('id')->firstOrFail();

        // Checkout → pay with wallet → confirmation
        Livewire::actingAs($user)->test(Checkout::class, ['order' => $draft])
            ->set('agree', true)
            ->set('paymentMethod', 'dream_wallet')
            ->call('pay')
            ->assertRedirect(route('orders.confirmed', $draft));

        $this->assertSame(OrderStatus::AwaitingGuardian, $draft->fresh()->status);
    }

    public function test_checkout_requires_terms_agreement(): void
    {
        $user = $this->demoUser();
        $service = Service::where('slug', 'seasonal-care')->firstOrFail();
        $draft = app(\App\Services\OrderService::class)->createDraft($user, $service, ['server' => 'global', 'plan' => 'one_day', 'guardian_pref' => 'any']);

        Livewire::actingAs($user)->test(Checkout::class, ['order' => $draft])
            ->set('agree', false)
            ->call('pay')
            ->assertHasErrors(['agree']);

        $this->assertSame(OrderStatus::Draft, $draft->fresh()->status);
    }

    public function test_wallet_mock_topup_credits_balance(): void
    {
        $user = $this->demoUser();
        $before = $user->walletBalanceMinor();

        Livewire::actingAs($user)->test(WalletManager::class)
            ->set('preset', 30)
            ->set('custom', '')
            ->set('method', 'online_banking')
            ->call('topUp');

        $this->assertSame($before + 3000, $user->fresh()->walletBalanceMinor());
    }

    public function test_wallet_topup_rejects_tiny_amount(): void
    {
        $user = $this->demoUser();
        $before = $user->walletBalanceMinor();

        Livewire::actingAs($user)->test(WalletManager::class)
            ->set('preset', null)
            ->set('custom', '0')
            ->call('topUp')
            ->assertHasErrors(['custom']);

        $this->assertSame($before, $user->fresh()->walletBalanceMinor());
    }

    public function test_rewards_redeem_deducts_points_via_component(): void
    {
        $user = $this->demoUser();
        $reward = RewardItem::where('points_cost', 500)->firstOrFail();
        $before = $user->star_points;

        Livewire::actingAs($user)->test(RewardsCenter::class)
            ->call('redeem', $reward->id)
            ->assertHasNoErrors();

        $this->assertSame($before - 500, $user->fresh()->star_points);
    }

    public function test_rewards_redeem_blocks_when_insufficient(): void
    {
        $user = $this->demoUser();
        $user->update(['star_points' => 100]);
        $reward = RewardItem::where('points_cost', 500)->firstOrFail();

        Livewire::actingAs($user)->test(RewardsCenter::class)
            ->call('redeem', $reward->id)
            ->assertHasErrors(['redeem']);

        $this->assertSame(100, $user->fresh()->star_points);
    }

    public function test_profile_save_persists_and_validates(): void
    {
        $user = $this->demoUser();

        Livewire::actingAs($user)->test(ProfileSettings::class)
            ->set('displayName', 'Luna the Kind')
            ->set('email', 'luna.kind@example.com')
            ->set('language', 'zh')
            ->set('currency', 'RMB')
            ->call('save')
            ->assertHasNoErrors();

        $user->refresh();
        $this->assertSame('Luna the Kind', $user->display_name);
        $this->assertSame('luna.kind@example.com', $user->email);
        $this->assertSame('zh', $user->language);
    }

    public function test_profile_rejects_invalid_email(): void
    {
        $user = $this->demoUser();

        Livewire::actingAs($user)->test(ProfileSettings::class)
            ->set('email', 'not-an-email')
            ->call('save')
            ->assertHasErrors(['email']);
    }

    public function test_notification_toggle_persists_immediately(): void
    {
        $user = $this->demoUser();

        Livewire::actingAs($user)->test(ProfileSettings::class)
            ->set('notifyPromotions', true);

        $this->assertTrue((bool) $user->fresh()->notify_promotions);
    }

    public function test_help_page_and_contact_form(): void
    {
        $this->get('/help')->assertOk();

        Livewire::test(ContactForm::class)
            ->set('topic', 'Ordering')
            ->set('message', 'Hello, I need a hand with my order please.')
            ->call('submit')
            ->assertHasNoErrors();
    }
}
