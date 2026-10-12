<div>
    <x-hero eyebrow="Your Cart 🛒" title="Your Cart" image="hero.orders" script="Ready when you are ♡">
        Review your picks and check them out one by one when you’re ready.
    </x-hero>

    <div class="shell space-y-6 py-8">
        @if (count($rows) === 0)
            <x-card padding="p-10">
                <div class="flex flex-col items-center gap-3 text-center">
                    <span class="grid h-14 w-14 place-items-center rounded-2xl bg-blush text-primary"><x-icon name="bag" class="h-7 w-7" /></span>
                    <h2 class="font-display text-xl font-semibold text-plum">Your cart is empty</h2>
                    <p class="max-w-sm text-sm text-ink-soft">Browse our services and add the ones you’d like — they’ll wait for you here.</p>
                    <a href="{{ route('services.index') }}" class="btn-primary mt-2 px-6">Explore services <x-icon name="arrow-right" class="h-4 w-4" /></a>
                </div>
            </x-card>
        @else
            <div class="flex items-center justify-between">
                <p class="text-sm text-ink-soft">{{ count($rows) }} item(s) in your cart</p>
                <button type="button" wire:click="clear" class="text-xs font-semibold text-primary underline">Clear cart</button>
            </div>

            <div class="space-y-4">
                @foreach ($rows as $row)
                    <x-card padding="p-4 sm:p-5" wire:key="cart-{{ $row['id'] }}">
                        <div class="flex gap-4">
                            <span class="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                                <x-image-slot :key="$row['service']->image_key" ratio="6/5" rounded="rounded-2xl" :alt="$row['service']->name" />
                            </span>
                            <div class="min-w-0 flex-1">
                                <div class="flex items-start justify-between gap-3">
                                    <div class="min-w-0">
                                        <h3 class="truncate font-display text-lg font-semibold text-plum">{{ $row['service']->name }}</h3>
                                        @if ($row['packageName'])
                                            <p class="truncate text-sm font-semibold text-primary">{{ $row['packageName'] }}</p>
                                        @else
                                            <p class="truncate text-sm text-ink-soft">{{ $row['service']->tagline }}</p>
                                        @endif
                                    </div>
                                    <button type="button" wire:click="remove('{{ $row['id'] }}')" class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-blush-soft hover:text-primary" aria-label="Remove item">
                                        <x-icon name="close" class="h-4 w-4" />
                                    </button>
                                </div>

                                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                                    <div class="inline-flex items-center rounded-full border border-blush-deep/60 bg-white">
                                        <button type="button" wire:click="decrementQty('{{ $row['id'] }}')" @disabled($row['quantity'] <= 1)
                                                class="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-plum hover:text-primary disabled:opacity-40" aria-label="Decrease quantity">−</button>
                                        <span class="w-9 text-center font-semibold text-plum">{{ $row['quantity'] }}</span>
                                        <button type="button" wire:click="incrementQty('{{ $row['id'] }}')" @disabled($row['quantity'] >= 99)
                                                class="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-plum hover:text-primary disabled:opacity-40" aria-label="Increase quantity">+</button>
                                    </div>

                                    <div class="flex items-center gap-4">
                                        <span class="font-display text-lg font-semibold text-primary">{{ $row['lineFormatted'] }}</span>
                                        <button type="button" wire:click="checkoutItem('{{ $row['id'] }}')" class="btn-primary px-5">
                                            Checkout <x-icon name="arrow-right" class="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </x-card>
                @endforeach
            </div>

            <x-card padding="p-5">
                <div class="flex items-center justify-between">
                    <span class="font-semibold text-plum">Subtotal</span>
                    <span class="font-display text-xl font-semibold text-primary">{{ implode(' + ', $subtotalLabels) }}</span>
                </div>
                <p class="mt-2 text-xs text-ink-muted">Each item checks out as its own order, so you’ll confirm and pay for them one at a time.</p>
            </x-card>
        @endif
    </div>
</div>
