<?php

namespace App\Livewire\Shop;

use App\Enums\OrderStatus;
use App\Exceptions\InsufficientFundsException;
use App\Models\Order;
use App\Services\PaymentService;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Checkout')]
class Checkout extends Component
{
    public Order $order;

    public string $paymentMethod = PaymentService::METHOD_WALLET;

    public string $coupon = '';

    public ?string $couponMessage = null;

    public bool $agree = false;

    public function mount(Order $order): void
    {
        // Access control: only the owner may view / pay for this order.
        $this->authorize('pay', $order);

        // Already paid → jump straight to the confirmation screen (idempotent UX).
        if ($order->status !== OrderStatus::Draft && $order->status !== OrderStatus::AwaitingPayment) {
            $this->redirectRoute('orders.confirmed', $order, navigate: true);

            return;
        }

        $this->order = $order;
    }

    public function applyCoupon(): void
    {
        // Coupons are not available in this build (documented). Never silently "apply".
        $this->couponMessage = $this->coupon === ''
            ? 'Enter a coupon code to apply.'
            : 'Coupons aren’t available yet — your total is unchanged.';
    }

    public function pay(PaymentService $payments)
    {
        $this->authorize('pay', $this->order);

        $this->validate([
            'agree' => 'accepted',
            'paymentMethod' => 'required|in:dream_wallet,online_banking,ewallet',
        ], [
            'agree.accepted' => 'Please agree to the Terms of Service to continue.',
        ]);

        try {
            $order = $payments->pay($this->order, $this->paymentMethod);
        } catch (InsufficientFundsException $e) {
            $this->addError('paymentMethod', $e->getMessage());

            return null;
        }

        session()->flash('success', 'Payment successful — your order is on its way!');

        return $this->redirectRoute('orders.confirmed', $order, navigate: true);
    }

    public function render()
    {
        $walletMinor = auth()->user()->walletBalanceMinor();

        return view('livewire.shop.checkout', [
            'walletMinor' => $walletMinor,
            'remainingMinor' => $walletMinor - $this->order->amount_minor,
            'summary' => $this->order->configSummary(),
            'insufficient' => $this->paymentMethod === PaymentService::METHOD_WALLET
                && $walletMinor < $this->order->amount_minor,
        ]);
    }
}
