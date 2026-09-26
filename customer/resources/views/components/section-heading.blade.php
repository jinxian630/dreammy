@props(['icon' => null, 'title' => '', 'subtitle' => null, 'accent' => null])

<div {{ $attributes->merge(['class' => 'mb-5 flex items-start justify-between gap-4']) }}>
    <div class="flex items-start gap-3">
        @if ($icon)
            <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blush text-primary">
                <x-icon :name="$icon" class="h-5 w-5" />
            </span>
        @endif
        <div>
            <h2 class="font-display text-xl font-semibold leading-tight text-plum sm:text-2xl">{{ $title }}</h2>
            @if ($subtitle)
                <p class="mt-0.5 text-sm text-ink-soft">{{ $subtitle }}</p>
            @endif
        </div>
    </div>
    @if ($accent)
        <p class="hidden shrink-0 font-script text-lg text-rose sm:block">{{ $accent }}</p>
    @endif
</div>
