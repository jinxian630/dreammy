<div class="card overflow-hidden">
    <div class="border-b border-blush bg-blush-soft px-5 py-5 sm:px-6">
        <h2 class="font-display text-xl font-semibold text-plum">Configure Your Service</h2>
        <p class="text-sm text-ink-soft">Choose your preferences and let us take care of the rest.</p>
    </div>

    <div class="space-y-6 p-5 sm:p-6">
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

        <div class="flex flex-col gap-4 border-t border-blush pt-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-ink-soft">Total Price</p>
                <p class="font-display text-3xl font-semibold text-primary">{{ $total->format(config('dreammy.currency.symbol')) }}</p>
            </div>
            <button type="button" wire:click="continue" wire:loading.attr="disabled" class="btn-primary w-full px-8 sm:w-auto">
                <span wire:loading.remove wire:target="continue">Continue <x-icon name="arrow-right" class="h-4 w-4" /></span>
                <span wire:loading wire:target="continue">Please wait…</span>
            </button>
        </div>
        <p class="text-center text-xs text-ink-muted sm:text-right">By continuing, you agree to our <a href="#" class="text-primary underline">Terms of Service</a> and confirm that your account information is correct.</p>
    </div>
</div>
