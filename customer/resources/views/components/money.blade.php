@props(['minor' => 0, 'symbol' => null, 'signed' => false])

@php
    $sym = $symbol ?? config('dreammy.currency.symbol', 'RM');
    $per = (int) config('dreammy.currency.minor_per_major', 100);
    $minor = (int) $minor;
    $value = number_format(abs($minor) / $per, 2);
    $sign = $signed ? ($minor < 0 ? '− ' : '+ ') : '';
@endphp

<span {{ $attributes }}>{{ $sign }}{{ $sym }} {{ $value }}</span>
