@props(['title' => '', 'icon' => null, 'open' => false])

<div x-data="{ open: @js($open) }" {{ $attributes->merge(['class' => 'card overflow-hidden']) }}>
    <button type="button" @click="open = !open" class="flex w-full items-center justify-between gap-3 p-4 text-left" :aria-expanded="open">
        <span class="flex items-center gap-2 font-semibold text-plum">
            @if ($icon)<x-icon :name="$icon" class="h-5 w-5 text-primary" />@endif
            {{ $title }}
        </span>
        <x-icon name="chevron-down" class="h-5 w-5 shrink-0 text-ink-muted transition" x-bind:class="open && 'rotate-180'" />
    </button>
    <div x-show="open" x-cloak x-collapse.duration.200ms class="border-t border-blush px-4 pb-4 pt-3">
        {{ $slot }}
    </div>
</div>
