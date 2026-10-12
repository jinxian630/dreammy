<?php

namespace App\Livewire\Shop;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\PaymentService;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Checkout')]
class Checkout extends Component
{
    public Order $order;

    public string $paymentMethod = PaymentService::METHOD_TNG;

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
        // Payment method is fixed by the order currency (MYR → TNG, CNY → Alipay).
        $this->paymentMethod = PaymentService::methodForCurrency($order->currency);
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

        // Lock the method to the order currency — ignore any tampered client value.
        $this->paymentMethod = PaymentService::methodForCurrency($this->order->currency);

        $this->validate([
            'agree' => 'accepted',
            'paymentMethod' => 'required|in:tng,alipay',
        ], [
            'agree.accepted' => 'Please agree to the Terms of Service to continue.',
        ]);

        $order = $payments->pay($this->order, $this->paymentMethod);

        session()->flash('success', 'Payment successful — your order is on its way!');

        return $this->redirectRoute('orders.confirmed', $order, navigate: true);
    }

    public function render()
    {
        return view('livewire.shop.checkout', [
            'summary' => $this->order->configSummary(),
        ]);
    }
}
