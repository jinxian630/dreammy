<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\WalletTransactionType;
use App\Exceptions\InsufficientFundsException;
use App\Models\Order;
use App\Models\OrderEvent;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public const METHOD_WALLET = 'dream_wallet';

    public const METHOD_ONLINE_BANKING = 'online_banking';

    public const METHOD_EWALLET = 'ewallet';

    public function __construct(private readonly PointsService $points) {}

    /**
     * Pay for an order. Idempotent: a second call on an already-paid order is a
     * no-op. A clicked button is NEVER proof of payment — the state transition
     * (and, for wallet, the balance debit) happens here, server-side, under a row lock.
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

            if ($method === self::METHOD_WALLET) {
                $balance = $locked->user->walletBalanceMinor();
                if ($balance < $locked->amount_minor) {
                    throw new InsufficientFundsException();
                }

                // Unique(order_id, type) guarantees at most one wallet payment per order.
                WalletTransaction::create([
                    'user_id' => $locked->user_id,
                    'order_id' => $locked->id,
                    'type' => WalletTransactionType::Payment,
                    'method' => $method,
                    'description' => $locked->service_name.' · Order '.$locked->order_code,
                    'amount_minor' => -1 * $locked->amount_minor,
                    'currency' => $locked->currency,
                    'status' => 'completed',
                ]);
            }
            // Online banking / e-wallet are DEV-ONLY MOCKS in this build: no real
            // gateway call. Money is considered received out-of-band; wallet is untouched.

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
