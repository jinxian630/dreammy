@php
    $methods = [
        ['value' => 'dream_wallet', 'icon' => 'wallet', 'title' => 'Dream Wallet', 'desc' => 'Your current balance. Will be deducted after payment.'],
        ['value' => 'online_banking', 'icon' => 'bank', 'title' => 'Online Banking', 'desc' => 'Pay securely via your bank.'],
        ['value' => 'ewallet', 'icon' => 'card', 'title' => 'E-wallet', 'desc' => "Touch 'n Go eWallet, GrabPay and more."],
    ];
@endphp

<div>
    <x-hero eyebrow="Checkout 🌸" title="Complete Your Order" image="hero.checkout" script="Small candles, brighter tomorrows ♡">
        Review your details, choose a payment method, and let's get your order on its way.
    </x-hero>

    <div class="shell space-y-6 py-8">
        {{-- Stepper --}}
        <x-card padding="p-5 sm:p-6">
            <x-progress-steps :steps="[
                ['label' => 'Service', 'sub' => 'Choose a service', 'state' => 'done'],
                ['label' => 'Review & pay', 'sub' => 'Confirm your details', 'state' => 'current'],
                ['label' => 'Confirmed', 'sub' => 'All set!', 'state' => 'pending'],
            ]" />
        </x-card>

        <div class="grid gap-6 lg:grid-cols-2">
            {{-- Left: order summary --}}
            <div class="space-y-6">
                <x-card padding="p-5 sm:p-6">
                    <x-section-heading icon="document" title="Order Summary" subtitle="Please review your service details." />
                    <div class="flex gap-4">
                        <span class="h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
                            <x-image-slot :key="$order->service_image_key" ratio="7/6" rounded="rounded-2xl" :alt="$order->service_name" />
                        </span>
                        <div class="min-w-0">
                            <h3 class="font-display text-lg font-semibold text-plum">{{ $order->service_name }}</h3>
                            <p class="text-sm text-ink-soft">{{ $order->service_tagline }}</p>
                        </div>
                    </div>
                    <dl class="mt-5 divide-y divide-blush/70">
                        @foreach ($summary as $row)
                            <div class="flex items-start justify-between gap-4 py-2.5">
                                <dt class="flex items-center gap-2 text-sm text-ink-soft"><x-icon :name="$row['icon']" class="h-4 w-4 text-ink-muted" />{{ $row['label'] }}</dt>
                                <dd class="max-w-[60%] text-right text-sm font-medium text-plum">{{ $row['value'] }}</dd>
                            </div>
                        @endforeach
                    </dl>
                </x-card>

                <div class="relative isolate hidden overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6 lg:block">
                    <x-image-slot key="banner.checkout-thankyou" ratio="5/4" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full opacity-50" />
                    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blush-soft via-blush-soft/85 to-transparent"></div>
                    <h3 class="font-display text-2xl font-semibold text-plum">Thank you<br>for keeping the Sky kind.</h3>
                    <p class="mt-2 max-w-sm text-sm text-ink-soft">Every candle you send helps light up brighter tomorrows for everyone. <span class="text-primary">♡</span></p>
                </div>
            </div>

            {{-- Right: payment --}}
            <div class="space-y-6">
                <x-card padding="p-5 sm:p-6">
                    <x-section-heading icon="card" title="Payment Method" subtitle="Choose how you'd like to pay." />
                    <div class="space-y-3">
                        @foreach ($methods as $m)
                            @php $active = $paymentMethod === $m['value']; @endphp
                            <label @class([
                                'flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition',
                                'border-primary bg-primary-soft/40' => $active,
                                'border-blush-deep/60 hover:border-primary/40' => ! $active,
                            ])>
                                <input type="radio" wire:model.live="paymentMethod" value="{{ $m['value'] }}" class="text-primary focus:ring-primary/40">
                                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blush text-primary"><x-icon :name="$m['icon']" class="h-5 w-5" /></span>
                                <span class="min-w-0 flex-1">
                                    <span class="flex items-center justify-between gap-2">
                                        <span class="font-semibold text-plum">{{ $m['title'] }}</span>
                                        @if ($m['value'] === 'dream_wallet')
                                            <span class="text-sm font-semibold text-plum"><x-money :minor="$walletMinor" /></span>
                                        @endif
                                    </span>
                                    <span class="block text-xs text-ink-soft">{{ $m['desc'] }}</span>
                                    @if ($m['value'] !== 'dream_wallet')
                                        <span class="mt-1 inline-block rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">Dev mock — no real gateway</span>
                                    @endif
                                </span>
                            </label>
                        @endforeach
                    </div>
                    @error('paymentMethod') <p class="mt-2 text-sm text-primary">{{ $message }}</p> @enderror
                </x-card>

                <x-card padding="p-5 sm:p-6">
                    <div class="mb-2 flex items-center gap-2">
                        <x-icon name="tag" class="h-4 w-4 text-primary" />
                        <h3 class="font-semibold text-plum">Coupon Code (Optional)</h3>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" wire:model="coupon" placeholder="Enter coupon code" class="field rounded-2xl">
                        <button type="button" wire:click="applyCoupon" class="btn-ghost border border-blush-deep/60 px-5">Apply</button>
                    </div>
                    @if ($couponMessage) <p class="mt-2 text-xs text-ink-muted">{{ $couponMessage }}</p> @endif
                </x-card>

                <x-card padding="p-5 sm:p-6">
                    <x-section-heading icon="document" title="Order Total" />
                    <div class="space-y-2 text-sm">
                        <div class="flex items-center justify-between text-ink-soft">
                            <span>Service price</span><span><x-money :minor="$order->amount_minor" /></span>
                        </div>
                        <div class="flex items-center justify-between rounded-2xl bg-blush-soft px-3 py-2.5">
                            <span class="font-semibold text-plum">Total Payment</span>
                            <span class="font-display text-xl font-semibold text-primary"><x-money :minor="$order->amount_minor" /></span>
                        </div>
                        @if ($paymentMethod === 'dream_wallet')
                            <div class="flex items-center justify-between text-ink-soft">
                                <span>Remaining Dream Wallet balance</span>
                                <span class="{{ $remainingMinor < 0 ? 'text-primary' : '' }}"><x-money :minor="max($remainingMinor, 0)" /></span>
                            </div>
                        @endif
                    </div>

                    @if ($insufficient)
                        <div class="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-warn/30 bg-warn-soft px-3 py-2.5 text-xs text-warn">
                            <span>Not enough wallet balance for this order.</span>
                            <a href="{{ route('wallet.index') }}" class="font-semibold underline">Top up</a>
                        </div>
                    @endif

                    <label class="mt-4 flex items-start gap-2 text-sm text-ink-soft">
                        <input type="checkbox" wire:model.live="agree" class="mt-0.5 rounded border-blush-deep text-primary focus:ring-primary/40">
                        <span>I agree to the <a href="#" class="text-primary underline">Terms of Service</a> and confirm that my order details are correct.</span>
                    </label>
                    @error('agree') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror

                    <button type="button" wire:click="pay" wire:loading.attr="disabled"
                            @disabled($insufficient)
                            class="btn-primary mt-4 w-full py-4 text-base">
                        <x-icon name="lock" class="h-4 w-4" />
                        <span wire:loading.remove wire:target="pay">Pay <x-money :minor="$order->amount_minor" /> <x-icon name="arrow-right" class="h-4 w-4" /></span>
                        <span wire:loading wire:target="pay">Processing…</span>
                    </button>
                    <p class="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted"><x-icon name="lock" class="h-3.5 w-3.5" /> Secure payment. Your information is protected.</p>
                </x-card>
            </div>
        </div>
    </div>
</div>
