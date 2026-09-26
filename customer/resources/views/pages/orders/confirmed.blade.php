@php
    $next = [
        ['icon' => 'users', 'title' => 'Guardian accepts', 'desc' => 'A trusted Guardian will review your order and accept it soon.'],
        ['icon' => 'sparkle', 'title' => 'Service begins', 'desc' => 'Your Guardian will start the '.$order->service_name.' and keep you updated if needed.'],
        ['icon' => 'document', 'title' => 'Completion report', 'desc' => "Once completed, you'll receive a report with the details."],
    ];
@endphp

<x-layouts.app title="Order Confirmed">
    <div class="relative isolate overflow-hidden border-b border-blush/50">
        <x-image-slot key="hero.confirmed" ratio="21/9" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full" />
        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-cream-page/95 via-cream-page/80 to-cream-page/30"></div>
        <div class="shell py-10 lg:py-14">
            <div class="flex items-start gap-4">
                <span class="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white shadow-soft" style="background-image:linear-gradient(135deg,#F2B33C,#E7972E)">
                    <x-icon name="check" class="h-7 w-7" />
                </span>
                <div>
                    <p class="text-sm font-semibold text-gold-deep">Payment successful</p>
                    <h1 class="font-display text-3xl font-semibold leading-tight text-plum sm:text-4xl">Your next adventure<br class="hidden sm:block"> is in good hands.</h1>
                    <p class="mt-2 max-w-xl text-sm text-ink-soft">Thank you for spreading kindness across the Sky. We've received your payment and your order is on its way!</p>
                </div>
            </div>
        </div>
    </div>

    <div class="shell space-y-6 py-8">
        <div class="grid gap-6 lg:grid-cols-2">
            {{-- Order details --}}
            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center justify-between">
                    <div class="flex items-center gap-2"><x-icon name="document" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Order Details</h2></div>
                    <span class="text-sm text-ink-muted">Order {{ $order->order_code }}</span>
                </div>
                <div class="flex gap-4">
                    <span class="h-20 w-24 shrink-0 overflow-hidden rounded-2xl">
                        <x-image-slot :key="$order->service_image_key" ratio="6/5" rounded="rounded-2xl" :alt="$order->service_name" />
                    </span>
                    <div>
                        <h3 class="font-display text-lg font-semibold text-plum">{{ $order->service_name }}</h3>
                        <p class="text-sm text-ink-soft">{{ $order->service_tagline }}</p>
                    </div>
                </div>
                <dl class="mt-5 divide-y divide-blush/70">
                    @foreach ($order->configSummary() as $row)
                        <div class="flex items-start justify-between gap-4 py-2.5">
                            <dt class="flex items-center gap-2 text-sm text-ink-soft"><x-icon :name="$row['icon']" class="h-4 w-4 text-ink-muted" />{{ $row['label'] }}</dt>
                            <dd class="max-w-[60%] text-right text-sm font-medium text-plum">{{ $row['value'] }}</dd>
                        </div>
                    @endforeach
                    <div class="flex items-start justify-between gap-4 py-2.5">
                        <dt class="flex items-center gap-2 text-sm text-ink-soft"><x-icon name="calendar" class="h-4 w-4 text-ink-muted" />Order date</dt>
                        <dd class="text-right text-sm font-medium text-plum">{{ optional($order->placed_at)->format('M j, Y, g:i A') }}</dd>
                    </div>
                </dl>
                <div class="mt-4 flex items-center justify-between rounded-2xl bg-blush-soft px-4 py-3">
                    <span class="font-semibold text-plum">Payment status</span>
                    <span class="font-semibold text-success">Paid <x-money :minor="$order->amount_minor" /></span>
                </div>
            </x-card>

            {{-- What happens next --}}
            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center gap-2"><x-icon name="sparkle" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">What happens next?</h2></div>
                <ol class="space-y-5">
                    @foreach ($next as $i => $step)
                        <li class="flex gap-3">
                            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-white">{{ $i + 1 }}</span>
                            <div class="flex items-start gap-2">
                                <x-icon :name="$step['icon']" class="mt-0.5 h-5 w-5 text-primary" />
                                <div>
                                    <p class="font-semibold text-plum">{{ $step['title'] }}</p>
                                    <p class="text-sm text-ink-soft">{{ $step['desc'] }}</p>
                                </div>
                            </div>
                        </li>
                    @endforeach
                </ol>
                <div class="mt-5 flex items-start gap-2 rounded-2xl bg-blush-soft px-4 py-3">
                    <x-icon name="heart" class="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                        <p class="font-semibold text-plum">Status: Awaiting Guardian</p>
                        <p class="text-sm text-ink-soft">We'll notify you as soon as a Guardian accepts your order.</p>
                    </div>
                </div>
            </x-card>
        </div>

        {{-- CTAs --}}
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a href="{{ route('orders.show', $order) }}" class="btn-primary px-8"><x-icon name="orders" class="h-4 w-4" /> Track order <x-icon name="arrow-right" class="h-4 w-4" /></a>
            <a href="{{ route('services.index') }}" class="btn-outline px-8"><x-icon name="compass" class="h-4 w-4" /> Explore services</a>
        </div>

        {{-- Thank you + need help --}}
        <div class="grid gap-6 lg:grid-cols-3">
            <div class="relative isolate overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6 lg:col-span-2">
                <x-image-slot key="banner.checkout-thankyou" ratio="21/9" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full opacity-50" />
                <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blush-soft via-blush-soft/85 to-transparent"></div>
                <h3 class="font-display text-2xl font-semibold text-plum">Thank you <span class="text-base font-normal text-ink-soft">for being part of a kinder Sky.</span></h3>
                <p class="mt-2 max-w-md text-sm text-ink-soft">Every candle you send helps light up brighter tomorrows for everyone. <span class="text-primary">♡</span></p>
            </div>
            <x-card padding="p-6">
                <div class="mb-2 flex items-center gap-2"><x-icon name="headset" class="h-5 w-5 text-primary" /><h3 class="font-semibold text-plum">Need help?</h3></div>
                <p class="text-sm text-ink-soft">If you have any questions about your order, we're here for you.</p>
                <a href="{{ route('help.index') }}" class="btn-outline mt-4 w-full"><x-icon name="mail" class="h-4 w-4" /> Contact Support</a>
            </x-card>
        </div>
    </div>
</x-layouts.app>
