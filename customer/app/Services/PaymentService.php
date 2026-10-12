<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderEvent;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    // Payment method is driven by the order currency: MYR → Touch 'n Go, CNY → Alipay.
    public const METHOD_TNG = 'tng';

    public const METHOD_ALIPAY = 'alipay';

    public function __construct(private readonly PointsService $points) {}

    /** The e-wallet method for an order's currency. */
    public static function methodForCurrency(string $currency): string
    {
        return strtoupper($currency) === 'CNY' ? self::METHOD_ALIPAY : self::METHOD_TNG;
    }

    /**
     * Pay for an order. Idempotent: a second call on an already-paid order is a
     * no-op. A clicked button is NEVER proof of payment — the state transition
     * happens here, server-side, under a row lock.
     *
     * Touch 'n Go / Alipay are DEV-ONLY MOCKS in this build: no real gateway
     * call. Money is considered received out-of-band.
     */
    public function pay(Order $order, string $method): Order
    {
        return DB::transaction(function () use ($order, $method) {
            /** @var Order $locked */
            $locked = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

            // Idempotent guard: already paid → return as-is.
            if ($locked->status !== OrderStatus::Draft && $locked->status !== OrderStatus::AwaitingPayment) {
                return $locked;
            }

            $locked->update([
                'status' => OrderStatus::AwaitingGuardian,
                'payment_method' => $method,
                'paid_at' => now(),
            ]);

            $this->seedInitialEvents($locked);
            $this->points->awardForOrder($locked->user, $locked);

            return $locked;
        });
    }

    private function seedInitialEvents(Order $order): void
    {
        if ($order->events()->exists()) {
            return;
        }

        OrderEvent::create([
            'order_id' => $order->id,
            'label' => 'Payment confirmed',
            'description' => 'Your order has been received. Thank you for your support!',
            'state' => 'done',
            'happened_at' => now(),
            'sort' => 1,
        ]);

        OrderEvent::create([
            'order_id' => $order->id,
            'label' => 'Finding your Guardian',
            'description' => "We're finding the right Guardian for your order. We'll notify you as soon as someone accepts it.",
            'state' => 'current',
            'happened_at' => now(),
            'sort' => 2,
        ]);
    }
}
