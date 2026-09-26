<?php

declare(strict_types=1);

namespace App\Enums;

enum WalletTransactionType: string
{
    case TopUp = 'topup';
    case Payment = 'payment';
    case Refund = 'refund';
    case Adjustment = 'adjustment';

    public function label(): string
    {
        return match ($this) {
            self::TopUp => 'Wallet top-up',
            self::Payment => 'Payment',
            self::Refund => 'Refund',
            self::Adjustment => 'Adjustment',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::TopUp => 'arrow-right',
            self::Payment => 'bag',
            self::Refund => 'refresh',
            self::Adjustment => 'sparkle',
        };
    }
}
