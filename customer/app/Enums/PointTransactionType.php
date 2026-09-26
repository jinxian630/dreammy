<?php

declare(strict_types=1);

namespace App\Enums;

enum PointTransactionType: string
{
    case Earn = 'earn';
    case Redeem = 'redeem';
    case Expire = 'expire';
    case Bonus = 'bonus';

    public function label(): string
    {
        return match ($this) {
            self::Earn => 'Earned',
            self::Redeem => 'Redeemed',
            self::Expire => 'Expired',
            self::Bonus => 'Bonus',
        };
    }
}
