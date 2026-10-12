<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Service;

/**
 * Display-currency resolution for the customer storefront.
 *
 * The customer toggles between MYR (RM) and CNY (¥). The choice lives in the
 * session (and is mirrored to the user's saved preference when logged in), and
 * drives both which service price is shown and the checkout payment method
 * (MYR → Touch 'n Go, CNY → Alipay).
 */
class Currency
{
    public const MYR = 'MYR';

    public const CNY = 'CNY';

    /** The currencies a customer may choose from. */
    public static function supported(): array
    {
        return [self::MYR, self::CNY];
    }

    public static function isSupported(string $code): bool
    {
        return in_array(strtoupper($code), self::supported(), true);
    }

    /** The current display currency: session → user preference → MYR. */
    public static function current(): string
    {
        $code = strtoupper((string) session('currency', auth()->user()?->currency ?? self::MYR));

        return self::isSupported($code) ? $code : self::MYR;
    }

    /** Currency symbol, e.g. "RM" / "¥". Defaults to the current currency. */
    public static function symbol(?string $code = null): string
    {
        $code = strtoupper($code ?? self::current());
        $symbols = config('dreammy.currency.symbols', ['MYR' => 'RM']);

        return $symbols[$code] ?? $code;
    }

    /**
     * The service price (in minor units) for the given currency, or null when
     * the service has no price in that currency (e.g. no CNY price set).
     */
    public static function priceMinorFor(Service $service, ?string $code = null): ?int
    {
        $code = strtoupper($code ?? self::current());

        if ($code === self::CNY) {
            return $service->price_cny_minor !== null ? (int) $service->price_cny_minor : null;
        }

        return (int) $service->price_minor;
    }

    /**
     * A package's price (in minor units) for the given currency, or null when
     * the package has no price in that currency (e.g. no CNY price set).
     *
     * @param  array{price_minor:int,price_cny_minor:?int}  $package
     */
    public static function packagePriceMinor(array $package, ?string $code = null): ?int
    {
        $code = strtoupper($code ?? self::current());

        if ($code === self::CNY) {
            return isset($package['price_cny_minor']) && $package['price_cny_minor'] !== null
                ? (int) $package['price_cny_minor']
                : null;
        }

        return (int) ($package['price_minor'] ?? 0);
    }

    /**
     * The unit base price (minor units) for a service in the given currency,
     * honouring the selected package when the service has packages.
     */
    public static function unitPriceMinor(Service $service, ?string $packageKey, ?string $code = null): ?int
    {
        $code = strtoupper($code ?? self::current());

        if ($service->hasPackages()) {
            $package = $service->findPackage($packageKey);

            return $package ? self::packagePriceMinor($package, $code) : null;
        }

        return self::priceMinorFor($service, $code);
    }
}
