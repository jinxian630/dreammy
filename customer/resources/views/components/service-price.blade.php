@props(['service'])

{{-- Shows a service's price in the customer's selected currency (RM / ¥).
     When the service has packages, shows "from <cheapest package>".
     Renders "—" when there's no price in that currency. --}}
@php
    $symbol = \App\Support\Currency::symbol();
    $prefix = false;

    if ($service->hasPackages()) {
        $prices = [];
        foreach ($service->packageList() as $p) {
            $m = \App\Support\Currency::packagePriceMinor($p);
            if ($m !== null) {
                $prices[] = $m;
            }
        }
        $minor = count($prices) ? min($prices) : null;
        $prefix = true;
    } else {
        $minor = \App\Support\Currency::priceMinorFor($service);
    }
@endphp

@if ($minor === null)
    <span {{ $attributes }}>—</span>
@else
    <span {{ $attributes }}>{{ $prefix ? 'from ' : '' }}{{ $symbol }} {{ number_format($minor / 100, 2) }}</span>
@endif
