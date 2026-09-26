<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class InsufficientFundsException extends RuntimeException
{
    public function __construct(string $message = 'Not enough Dream Wallet balance for this payment.')
    {
        parent::__construct($message);
    }
}
