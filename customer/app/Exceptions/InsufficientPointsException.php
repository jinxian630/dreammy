<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

class InsufficientPointsException extends RuntimeException
{
    public function __construct(string $message = 'Not enough Star Points to redeem this reward.')
    {
        parent::__construct($message);
    }
}
