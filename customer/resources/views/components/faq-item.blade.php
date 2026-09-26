@props(['question' => '', 'open' => false])

<div x-data="{ open: @js($open) }" class="border-b border-blush last:border-0">
    <button type="button" @click="open = !open"
            class="flex w-full items-center justify-between gap-4 py-4 text-left"
            :aria-expanded="open">
        <span class="font-semibold text-plum">{{ $question }}</span>
        <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-blush-soft text-primary">
            <x-icon name="plus" class="h-4 w-4" x-show="!open" />
            <x-icon name="minus" class="h-4 w-4" x-show="open" x-cloak />
        </span>
    </button>
    <div x-show="open" x-cloak x-collapse.duration.200ms class="pb-4 pr-10 text-sm text-ink-soft">
        {{ $slot }}
    </div>
</div>
