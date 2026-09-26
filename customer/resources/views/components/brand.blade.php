@props(['compact' => false])

<a href="{{ route('home') }}" {{ $attributes->merge(['class' => 'inline-flex items-center gap-2 group']) }}>
    <x-icon name="sparkle" :filled="true" class="h-7 w-7 shrink-0 text-primary transition group-hover:scale-110" />
    <span class="leading-tight">
        <span class="block font-display text-xl font-semibold tracking-tight text-primary">{{ config('dreammy.brand.name') }}</span>
        @unless ($compact)
            <span class="block text-[11px] text-ink-muted">{{ config('dreammy.brand.tagline') }}</span>
        @endunless
    </span>
</a>
