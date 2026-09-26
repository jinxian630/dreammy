<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\PointTransactionType;
use App\Exceptions\InsufficientPointsException;
use App\Models\Order;
use App\Models\PointTransaction;
use App\Models\RewardItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PointsService
{
    /** Award earn points for a paid order. Returns points awarded. */
    public function awardForOrder(User $user, Order $order): int
    {
        $rate = (int) config('dreammy.points.per_myr_sen', 1);
        $points = intdiv($order->amount_minor * $rate, 1); // minor units are sen; 1 sen = 1 point

        if ($points <= 0) {
            return 0;
        }

        $months = (int) config('dreammy.points.expiry_months', 12);

        PointTransaction::create([
            'user_id' => $user->id,
            'order_id' => $order->id,
            'type' => PointTransactionType::Earn,
            'points' => $points,
            'description' => 'Earned from order '.$order->order_code,
            'expires_at' => now()->addMonths($months),
        ]);

        $user->increment('star_points', $points);

        return $points;
    }

    /**
     * Redeem a reward. Guards balance + Band C monthly cap. Idempotency is not
     * required here (each click is a distinct redemption) but the balance check
     * runs under a row lock to avoid overspend on concurrent clicks.
     */
    public function redeem(User $user, RewardItem $item): PointTransaction
    {
        if (! $item->is_available) {
            throw new RuntimeException('This reward is not available right now.');
        }

        return DB::transaction(function () use ($user, $item) {
            /** @var User $locked */
            $locked = User::whereKey($user->id)->lockForUpdate()->firstOrFail();

            if ($locked->star_points < $item->points_cost) {
                throw new InsufficientPointsException();
            }

            if ($item->band === 'C') {
                $cap = (int) config('dreammy.points.band_c_per_customer_30d', 1);
                $recent = PointTransaction::where('user_id', $locked->id)
                    ->where('type', PointTransactionType::Redeem)
                    ->whereHas('reward', fn ($q) => $q->where('band', 'C'))
                    ->where('created_at', '>=', now()->subDays(30))
                    ->count();
                if ($recent >= $cap) {
                    throw new RuntimeException('You have reached the limit for this reward tier this month.');
                }
            }

            $tx = PointTransaction::create([
                'user_id' => $locked->id,
                'reward_item_id' => $item->id,
                'type' => PointTransactionType::Redeem,
                'points' => -1 * $item->points_cost,
                'description' => 'Redeemed '.$item->name,
            ]);

            $locked->decrement('star_points', $item->points_cost);
            $user->refresh();

            return $tx;
        });
    }
}
