<?php

declare(strict_types=1);

namespace App\Services;

use App\Enums\WalletTransactionType;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WalletService
{
    /**
     * DEV-ONLY MOCK top-up. In production this must be gated behind an approved
     * payment proof / gateway callback — a button click is not proof of payment.
     * Here we credit the ledger immediately so the flow is demonstrable.
     */
    public function mockTopUp(User $user, int $amountMinor, string $method): WalletTransaction
    {
        return DB::transaction(function () use ($user, $amountMinor, $method) {
            return WalletTransaction::create([
                'user_id' => $user->id,
                'type' => WalletTransactionType::TopUp,
                'method' => $method,
                'description' => 'Wallet top-up ('.str_replace('_', ' ', $method).')',
                'amount_minor' => abs($amountMinor),
                'currency' => $user->currency ?: 'MYR',
                'status' => 'completed',
                'reference' => 'MOCK-'.Str::upper(Str::random(8)),
            ]);
        });
    }
}
