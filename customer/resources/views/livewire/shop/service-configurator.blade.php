<div class="card overflow-hidden">
    <div class="border-b border-blush bg-blush-soft px-5 py-5 sm:px-6">
        <h2 class="font-display text-xl font-semibold text-plum">Configure Your Service</h2>
        <p class="text-sm text-ink-soft">Choose your preferences and let us take care of the rest.</p>
    </div>

    <div class="space-y-6 p-5 sm:p-6">
        @if (count($packages) > 0)
            <div>
                <label class="mb-2 block text-sm font-semibold text-plum">Choose a package</label>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    @foreach ($packages as $package)
                        @php
                            $isActive = $packageKey === $package['key'];
                            $pkgMinor = \App\Support\Currency::packagePriceMinor($package);
                        @endphp
                        <button type="button" wire:click="selectPackage('{{ $package['key'] }}')"
                                @class([
                                    'flex items-start justify-between gap-3 rounded-2xl border p-3 text-left transition',
                                    'border-primary bg-primary-soft/40' => $isActive,
                                    'border-blush-deep/60 bg-white hover:border-primary/50' => ! $isActive,
                                ])>
                            <span class="min-w-0">
                                <span class="block font-semibold text-plum">{{ $package['name'] }}</span>
                                @if (! empty($package['description']))
                                    <span class="block text-xs text-ink-soft">{{ $package['description'] }}</span>
                                @endif
                            </span>
                            <span class="shrink-0 font-display font-semibold text-primary">
                                {{ $pkgMinor !== null ? \App\Support\Currency::symbol().' '.number_format($pkgMinor / 100, 2) : '—' }}
                            </span>
                        </button>
                    @endforeach
                </div>
            </div>
        @endif

        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
            @foreach ($schema['options'] ?? [] as $option)
                @php
                    $key = $option['key'];
                    $type = $option['type'] ?? 'text';
                    $selected = $selections[$key] ?? null;
                    $fullWidth = $type === 'text';
                @endphp

                <div class="{{ $fullWidth ? 'sm:col-span-2' : '' }}">
                    <label class="mb-2 flex items-center gap-1.5 text-sm font-semibold text-plum">
                        @if (! empty($option['icon']))<x-icon :name="$option['icon']" class="h-4 w-4 text-primary" />@endif
                        {{ $option['label'] }}
                    </label>

                    @if ($type === 'choice')
                        <div class="grid grid-cols-2 gap-2">
                            @foreach ($option['choices'] as $choice)
                                <button type="button" wire:click="select('{{ $key }}', '{{ $choice['value'] }}')"
                                        @class([
                                            'flex items-center justify-center gap-1.5 rounded-2xl border px-3 py-3 text-sm font-medium transition',
                                            'border-transparent text-white shadow-soft' => $selected === $choice['value'],
                                            'border-blush-deep/70 bg-white text-ink-soft hover:border-primary/50' => $selected !== $choice['value'],
                                        ])
                                        @if($selected === $choice['value']) style="background-image:linear-gradient(120deg,#C43C6E,#E86A9A)" @endif>
                                    {{ $choice['label'] }}
                                    @if (($choice['price_minor'] ?? 0) > 0)
                                        <span class="text-xs opacity-80">+<x-money :minor="$choice['price_minor']" /></span>
                                    @endif
                                </button>
                            @endforeach
                        </div>
                    @elseif ($type === 'select')
                        <select wire:model.live="selections.{{ $key }}" class="field rounded-2xl">
                            @foreach ($option['choices'] as $choice)
                                <option value="{{ $choice['value'] }}">{{ $choice['label'] }}</option>
                            @endforeach
                        </select>
                    @elseif ($type === 'text')
                        <div x-data="{ len: $wire.selections['{{ $key }}']?.length ?? 0 }">
                            <textarea wire:model="selections.{{ $key }}" x-on:input="len = $event.target.value.length"
                                      maxlength="{{ $option['max'] ?? 200 }}" rows="3"
                                      placeholder="{{ $option['placeholder'] ?? '' }}" class="field rounded-2xl"></textarea>
                            <p class="mt-1 text-right text-xs text-ink-muted"><span x-text="len">0</span>/{{ $option['max'] ?? 200 }}</p>
                        </div>
                    @endif
                </div>
            @endforeach
        </div>

        <div class="flex items-center justify-between gap-4 border-t border-blush pt-5">
            <div>
                <p class="text-sm font-semibold text-plum">Quantity</p>
                <p class="text-xs text-ink-muted">How many you'd like.</p>
            </div>
            <div class="inline-flex items-center rounded-full border border-blush-deep/60 bg-white">
                <button type="button" wire:click="decrementQty" @disabled($quantity <= 1)
                        class="grid h-10 w-10 place-items-center rounded-full text-xl font-semibold text-plum transition hover:text-primary disabled:opacity-40"
                        aria-label="Decrease quantity">−</button>
                <input type="number" min="1" max="99" inputmode="numeric" wire:model.blur="quantity"
                       class="w-12 border-0 bg-transparent p-0 text-center font-display text-lg font-semibold text-plum focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                       aria-label="Quantity" />
                <button type="button" wire:click="incrementQty" @disabled($quantity >= 99)
                        class="grid h-10 w-10 place-items-center rounded-full text-xl font-semibold text-plum transition hover:text-primary disabled:opacity-40"
                        aria-label="Increase quantity">+</button>
            </div>
        </div>

        <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-ink-soft">Total Price</p>
                @if ($available)
                    <p class="font-display text-3xl font-semibold text-primary">{{ $total->format($symbol) }}</p>
                @else
                    <p class="font-display text-2xl font-semibold text-ink-muted">—</p>
                    <p class="mt-1 text-xs text-primary">Not sold in ¥ — <a href="{{ route('currency.switch', 'myr') }}" class="underline">switch to RM</a> to order.</p>
                @endif
            </div>
            <div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button type="button" wire:click="addToCart" wire:loading.attr="disabled" wire:target="addToCart" @disabled(! $available)
                        class="btn-outline justify-center px-6 disabled:cursor-not-allowed disabled:opacity-50">
                    <x-icon name="bag" class="h-4 w-4" />
                    <span wire:loading.remove wire:target="addToCart">Add to Cart</span>
                    <span wire:loading wire:target="addToCart">Adding…</span>
                </button>
                <button type="button" wire:click="continue" wire:loading.attr="disabled" wire:target="continue" @disabled(! $available)
                        class="btn-primary justify-center px-8 disabled:cursor-not-allowed disabled:opacity-50">
                    <span wire:loading.remove wire:target="continue">Buy Now <x-icon name="arrow-right" class="h-4 w-4" /></span>
                    <span wire:loading wire:target="continue">Please wait…</span>
                </button>
            </div>
        </div>

        @if ($justAdded)
            <div class="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-success/30 bg-success-soft px-3 py-2.5 text-sm text-success">
                <span class="flex items-center gap-1.5"><x-icon name="check-circle" class="h-4 w-4" /> Added to your cart.</span>
                <a href="{{ route('cart.index') }}" class="font-semibold underline">View cart</a>
            </div>
        @endif

        <p class="mt-3 text-center text-xs text-ink-muted sm:text-right">By continuing, you agree to our <a href="#" class="text-primary underline">Terms of Service</a> and confirm that your account information is correct.</p>
    </div>
</div>
