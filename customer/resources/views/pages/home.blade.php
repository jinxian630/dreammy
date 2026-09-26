@php
    $tiles = [
        ['title' => 'Candle Runs', 'desc' => 'More candles, more possibilities.', 'icon' => 'icon.candle-runs'],
        ['title' => 'Heart Delivery', 'desc' => 'Share kindness across the skies.', 'icon' => 'icon.heart-delivery'],
        ['title' => 'Season Passes', 'desc' => 'Unlock new horizons together.', 'icon' => 'icon.season-passes'],
        ['title' => 'Companions', 'desc' => 'Never travel alone again.', 'icon' => 'icon.companions'],
        ['title' => 'More Adventures', 'desc' => 'Explore all services and special offers.', 'icon' => 'icon.more-adventures'],
    ];
@endphp

<x-layouts.app title="Home">
    <x-hero
        :eyebrow="$user ? 'Welcome back, '.$user->displayName() : 'Welcome to Dreammy'"
        title="A little help. A lot more wonder."
        image="hero.home"
        script="Brighter journeys together">
        Same sky. Kinder journeys. Let's make more beautiful memories together.
        <x-slot:actions>
            <a href="{{ route('services.index') }}" class="btn-primary">Explore services <x-icon name="arrow-right" class="h-4 w-4" /></a>
            @auth
                <a href="{{ route('orders.index') }}" class="btn-outline">View my orders</a>
            @else
                <a href="{{ route('login') }}" class="btn-outline">Log in</a>
            @endauth
        </x-slot:actions>
    </x-hero>

    <div class="shell space-y-10 py-10">

        {{-- How can we help --}}
        <section>
            <x-section-heading title="How can we help?" accent="Five ways to a brighter Sky 🌸" />
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                @foreach ($tiles as $tile)
                    <a href="{{ route('services.index') }}" class="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift lg:flex-col lg:items-start lg:gap-3">
                        <span class="h-14 w-14 shrink-0 overflow-hidden rounded-2xl">
                            <x-image-slot :key="$tile['icon']" ratio="1/1" rounded="rounded-2xl" :alt="$tile['title']" />
                        </span>
                        <span class="min-w-0 flex-1">
                            <span class="flex items-center justify-between gap-2">
                                <span class="font-display text-base font-semibold text-plum">{{ $tile['title'] }}</span>
                                <x-icon name="chevron-right" class="h-4 w-4 shrink-0 text-primary lg:hidden" />
                            </span>
                            <span class="mt-0.5 block text-sm text-ink-soft">{{ $tile['desc'] }}</span>
                        </span>
                    </a>
                @endforeach
            </div>
        </section>

        @auth
            {{-- Current journey + wallet + points --}}
            <section>
                <x-section-heading title="Your current journey" accent="Good things take time" />
                <div class="grid grid-cols-1 gap-5 lg:grid-cols-4">
                    <div class="card p-5 lg:col-span-2">
                        @if ($currentOrder)
                            <div class="flex items-start gap-4">
                                <span class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl">
                                    <x-image-slot :key="$currentOrder->service_image_key" ratio="1/1" rounded="rounded-2xl" :alt="$currentOrder->service_name" />
                                </span>
                                <div class="min-w-0 flex-1">
                                    <div class="flex flex-wrap items-center justify-between gap-2">
                                        <h3 class="font-display text-lg font-semibold text-plum">{{ $currentOrder->service_name }}</h3>
                                        <x-status-badge :status="$currentOrder->status->value" />
                                    </div>
                                    @if ($currentOrder->guardian_name)
                                        <p class="text-sm text-ink-soft">Guardian · {{ $currentOrder->guardian_name }}</p>
                                    @endif
                                    @if ($currentOrder->progress_target > 0)
                                        <div class="mt-3">
                                            <div class="flex items-center justify-between text-xs text-ink-soft">
                                                <span>{{ $currentOrder->progress_current }} / {{ $currentOrder->progress_target }} {{ $currentOrder->progress_unit }}</span>
                                                <span class="font-semibold text-primary">{{ $currentOrder->progressPercent() }}%</span>
                                            </div>
                                            <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-blush">
                                                <div class="h-full rounded-full" style="width: {{ $currentOrder->progressPercent() }}%; background-image:linear-gradient(90deg,#C43C6E,#E86A9A)"></div>
                                            </div>
                                        </div>
                                    @endif
                                    <a href="{{ route('orders.show', $currentOrder) }}" class="btn-primary mt-4 px-4 py-2 text-xs">View order <x-icon name="arrow-right" class="h-4 w-4" /></a>
                                </div>
                            </div>
                        @else
                            <div class="flex h-full flex-col items-start justify-center gap-2">
                                <h3 class="font-display text-lg font-semibold text-plum">No active journey yet</h3>
                                <p class="text-sm text-ink-soft">When you place an order, you'll be able to track its progress here.</p>
                                <a href="{{ route('services.index') }}" class="btn-primary mt-2 px-4 py-2 text-xs">Explore services <x-icon name="arrow-right" class="h-4 w-4" /></a>
                            </div>
                        @endif
                    </div>

                    <div class="card flex flex-col justify-between p-5">
                        <div class="flex items-center gap-3">
                            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft text-gold-deep"><x-icon name="bag" class="h-5 w-5" /></span>
                            <div><p class="font-display font-semibold text-plum">Dream Wallet</p></div>
                        </div>
                        <p class="mt-3 font-display text-2xl font-semibold text-plum"><x-money :minor="$walletMinor" /></p>
                        <a href="{{ route('wallet.index') }}" class="btn-outline mt-3 px-4 py-2 text-xs">Top up <x-icon name="arrow-right" class="h-4 w-4" /></a>
                    </div>

                    <div class="card flex flex-col justify-between p-5">
                        <div class="flex items-center gap-3">
                            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-gold-soft text-gold-deep"><x-icon name="star" :filled="true" class="h-5 w-5" /></span>
                            <div><p class="font-display font-semibold text-plum">Star Points</p></div>
                        </div>
                        <p class="mt-3 font-display text-2xl font-semibold text-plum">{{ number_format($points) }}</p>
                        <a href="{{ route('rewards.index') }}" class="btn-outline mt-3 px-4 py-2 text-xs">View rewards <x-icon name="arrow-right" class="h-4 w-4" /></a>
                    </div>
                </div>
            </section>
        @endauth

        {{-- Account cared for band --}}
        <section class="relative isolate overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6 sm:p-8">
            <x-image-slot key="banner.account-cared" ratio="21/9" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full opacity-60" />
            <div class="absolute inset-0 -z-10 bg-gradient-to-r from-blush-soft via-blush-soft/85 to-transparent"></div>
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 class="font-display text-2xl font-semibold text-plum">Your account, cared for. <span class="text-primary">♡</span></h2>
                    <p class="mt-1 text-sm text-ink-soft">Verified Guardians. Secure order tracking.</p>
                </div>
                <div class="flex flex-wrap items-center gap-6 text-sm font-medium text-plum">
                    <span class="inline-flex items-center gap-2"><x-icon name="shield" class="h-5 w-5 text-primary" /> Privacy first</span>
                    <span class="inline-flex items-center gap-2"><x-icon name="users" class="h-5 w-5 text-primary" /> Dedicated support</span>
                </div>
            </div>
        </section>
    </div>
</x-layouts.app>
