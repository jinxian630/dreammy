<?php

declare(strict_types=1);

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case AwaitingPayment = 'awaiting_payment';
    case AwaitingGuardian = 'awaiting_guardian';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::AwaitingPayment => 'Awaiting payment',
            self::AwaitingGuardian => 'Awaiting Guardian',
            self::InProgress => 'In progress',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
        };
    }

    /** Statuses considered "open"/active for filtering. */
    public function isActive(): bool
    {
        return in_array($this, [self::AwaitingPayment, self::AwaitingGuardian, self::InProgress], true);
    }

    public function isPaid(): bool
    {
        return in_array($this, [self::AwaitingGuardian, self::InProgress, self::Completed], true);
    }
}
