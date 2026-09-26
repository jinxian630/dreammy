<?php

declare(strict_types=1);

namespace App\Domain\Pricing;

use App\Domain\Money\Money;

/**
 * Authoritative, data-driven pricing. Reads a service's config_schema and a set
 * of customer selections and returns the total. Pure — no DB, no framework.
 *
 * Schema shape:
 *  [ 'options' => [
 *      [ 'key' => 'plan', 'label' => 'Plan', 'type' => 'choice'|'select',
 *        'required' => true, 'choices' => [ ['value'=>'one_day','label'=>'One day','price_minor'=>0], ... ] ],
 *      [ 'key' => 'special_requests', 'type' => 'text', 'max' => 200 ],
 *  ] ]
 */
final class PricingService
{
    /**
     * @param  array<string,mixed>  $schema
     * @param  array<string,mixed>  $selections
     */
    public function total(array $schema, int $basePriceMinor, array $selections, string $currency = 'MYR'): Money
    {
        $total = Money::ofMinor($basePriceMinor, $currency);

        foreach ($this->choiceOptions($schema) as $option) {
            $selected = $selections[$option['key']] ?? null;
            foreach ($option['choices'] ?? [] as $choice) {
                if (($choice['value'] ?? null) === $selected) {
                    $total = $total->plus(Money::ofMinor((int) ($choice['price_minor'] ?? 0), $currency));
                }
            }
        }

        return $total;
    }

    /**
     * Normalise + validate selections against the schema. Returns clean selections.
     * Unknown keys are dropped; invalid choices fall back to the first/default.
     *
     * @param  array<string,mixed>  $schema
     * @param  array<string,mixed>  $selections
     * @return array<string,mixed>
     */
    public function normalise(array $schema, array $selections): array
    {
        $clean = [];

        foreach ($schema['options'] ?? [] as $option) {
            $key = $option['key'] ?? null;
            if (! $key) {
                continue;
            }

            $type = $option['type'] ?? 'text';

            if (in_array($type, ['choice', 'select'], true)) {
                $allowed = array_map(fn ($c) => $c['value'] ?? null, $option['choices'] ?? []);
                $value = $selections[$key] ?? null;
                if (! in_array($value, $allowed, true)) {
                    $value = $option['default'] ?? ($allowed[0] ?? null);
                }
                $clean[$key] = $value;
            } elseif ($type === 'text') {
                $value = (string) ($selections[$key] ?? '');
                $max = (int) ($option['max'] ?? 500);
                $clean[$key] = mb_substr(trim($value), 0, $max);
            }
        }

        return $clean;
    }

    /**
     * Human-readable label for a selected choice value (for summaries).
     *
     * @param  array<string,mixed>  $schema
     */
    public function choiceLabel(array $schema, string $key, mixed $value): ?string
    {
        foreach ($this->choiceOptions($schema) as $option) {
            if (($option['key'] ?? null) === $key) {
                foreach ($option['choices'] ?? [] as $choice) {
                    if (($choice['value'] ?? null) === $value) {
                        return $choice['label'] ?? (string) $value;
                    }
                }
            }
        }

        return $value === null || $value === '' ? null : (string) $value;
    }

    /**
     * @param  array<string,mixed>  $schema
     * @return array<int,array<string,mixed>>
     */
    private function choiceOptions(array $schema): array
    {
        return array_values(array_filter(
            $schema['options'] ?? [],
            fn ($o) => in_array($o['type'] ?? 'text', ['choice', 'select'], true),
        ));
    }
}
