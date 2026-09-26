<?php

declare(strict_types=1);

namespace App\Domain\Money;

use InvalidArgumentException;

/**
 * Money stored as integer minor units (e.g. sen). No floats — ever.
 * Pure value object: unit-testable with no framework dependencies.
 */
final readonly class Money
{
    private function __construct(
        public int $minor,
        public string $currency,
    ) {}

    public static function ofMinor(int $minor, string $currency = 'MYR'): self
    {
        return new self($minor, strtoupper($currency));
    }

    /** Build from a major-unit value (e.g. 12.35) without float drift. */
    public static function ofMajor(int|string $major, string $currency = 'MYR'): self
    {
        $minor = (int) round(((float) $major) * 100);

        return new self($minor, strtoupper($currency));
    }

    public static function zero(string $currency = 'MYR'): self
    {
        return new self(0, strtoupper($currency));
    }

    public function plus(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->minor + $other->minor, $this->currency);
    }

    public function minus(self $other): self
    {
        $this->assertSameCurrency($other);

        return new self($this->minor - $other->minor, $this->currency);
    }

    public function times(int $factor): self
    {
        return new self($this->minor * $factor, $this->currency);
    }

    public function isNegative(): bool
    {
        return $this->minor < 0;
    }

    public function isZero(): bool
    {
        return $this->minor === 0;
    }

    public function greaterThanOrEqual(self $other): bool
    {
        $this->assertSameCurrency($other);

        return $this->minor >= $other->minor;
    }

    public function format(?string $symbol = null): string
    {
        $sym = $symbol ?? 'RM';

        return $sym.' '.number_format($this->minor / 100, 2);
    }

    private function assertSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException("Currency mismatch: {$this->currency} vs {$other->currency}");
        }
    }
}
