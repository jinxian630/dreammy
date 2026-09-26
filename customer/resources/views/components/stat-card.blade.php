@props([
    'icon' => 'sparkle',
    'label' => '',
    'sublabel' => null,
    'value' => '',
    'href' => null,
    'tone' => 'primary', // primary | gold
])

@php
    $iconWrap = $tone === 'gold' ? 'bg-gold-soft text-gold-deep' : 'bg-blush text-primary';
    $tag = $href ? 'a' : 'div';
@endphp

<{{ $tag }} @if($href) href="{{ $href }}" @endif
    {{ $attributes->merge(['class' => 'card flex items-center gap-4 p-5 transition '.($href ? 'hover:shadow-lift' : '')]) }}>
    <span class="grid h-12 w-12 shrink-0 place-items-center rounded-2xl {{ $iconWrap }}">
        <x-icon :name="$icon" :filled="$tone === 'gold'" class="h-6 w-6" />
    </span>
    <div class="min-w-0 flex-1">
        <p class="font-display text-base font-semibold text-plum">{{ $label }}</p>
        @if ($sublabel)
            <p class="text-xs text-ink-soft">{{ $sublabel }}</p>
        @endif
    </div>
    <div class="flex items-center gap-2">
        <span class="font-display text-2xl font-semibold text-plum">{{ $value }}</span>
        @if ($href)
            <x-icon name="chevron-right" class="h-5 w-5 text-ink-muted" />
        @endif
    </div>
</{{ $tag }}>
