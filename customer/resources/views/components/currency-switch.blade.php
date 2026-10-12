@php
    $cur = \App\Support\Currency::current();
@endphp

{{-- RM / ¥ display-currency toggle. Drives service prices and the checkout
     payment method (MYR → Touch 'n Go, CNY → Alipay). --}}
<div {{ $attributes->merge(['class' => 'inline-flex items-center rounded-full border border-blush-deep/50 bg-white p-0.5 text-sm font-semibold']) }}
     role="group" aria-label="Currency">
    <a href="{{ route('currency.switch', 'myr') }}"
       @class(['rounded-full px-3 py-1.5 transition', 'bg-primary text-white shadow-soft' => $cur === 'MYR', 'text-ink-soft hover:text-primary' => $cur !== 'MYR'])
       @if($cur === 'MYR') aria-current="true" @endif>RM</a>
    <a href="{{ route('currency.switch', 'cny') }}"
       @class(['rounded-full px-3 py-1.5 transition', 'bg-primary text-white shadow-soft' => $cur === 'CNY', 'text-ink-soft hover:text-primary' => $cur !== 'CNY'])
       @if($cur === 'CNY') aria-current="true" @endif>¥</a>
</div>
