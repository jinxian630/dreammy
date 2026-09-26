<?php

namespace Tests\Unit;

use App\Domain\Money\Money;
use App\Domain\Pricing\PricingService;
use PHPUnit\Framework\TestCase;

class PricingTest extends TestCase
{
    private array $schema = [
        'options' => [
            ['key' => 'plan', 'type' => 'choice', 'choices' => [
                ['value' => 'one_day', 'label' => 'One day', 'price_minor' => 0],
                ['value' => 'seven_days', 'label' => '7 days', 'price_minor' => 4900],
            ]],
            ['key' => 'guardian_pref', 'type' => 'choice', 'choices' => [
                ['value' => 'any', 'label' => 'Any', 'price_minor' => 0],
                ['value' => 'choose', 'label' => 'Choose', 'price_minor' => 300],
            ]],
            ['key' => 'special_requests', 'type' => 'text', 'max' => 10],
        ],
    ];

    public function test_money_is_integer_minor_units_and_never_floats(): void
    {
        $a = Money::ofMinor(1035);
        $b = Money::ofMinor(200);
        $this->assertSame(1235, $a->plus($b)->minor);
        $this->assertSame('RM 12.35', $a->plus($b)->format('RM'));
    }

    public function test_total_sums_base_plus_selected_deltas(): void
    {
        $pricing = new PricingService();
        $total = $pricing->total($this->schema, 890, ['plan' => 'seven_days', 'guardian_pref' => 'choose']);
        $this->assertSame(6090, $total->minor);
    }

    public function test_total_ignores_unknown_and_defaults_to_base(): void
    {
        $pricing = new PricingService();
        $total = $pricing->total($this->schema, 890, ['plan' => 'nonexistent']);
        $this->assertSame(890, $total->minor);
    }

    public function test_normalise_falls_back_to_first_choice_and_truncates_text(): void
    {
        $pricing = new PricingService();
        $clean = $pricing->normalise($this->schema, ['plan' => 'bogus', 'special_requests' => 'way too long text here']);
        $this->assertSame('one_day', $clean['plan']);
        $this->assertSame('any', $clean['guardian_pref']);
        $this->assertSame(10, mb_strlen($clean['special_requests']));
    }
}
