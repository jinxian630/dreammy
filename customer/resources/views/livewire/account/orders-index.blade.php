@php
    $tabs = [
        'all' => 'All Orders',
        'awaiting' => 'Awaiting Guardian',
        'in_progress' => 'In Progress',
        'completed' => 'Completed',
    ];
@endphp

<div>
    <x-hero eyebrow="My Orders" title="Every journey, all in one place." image="hero.orders" script="Kindness travels far ♡">
        Track your orders, meet your Guardians, and relive the moments that make the Sky brighter.
    </x-hero>

    <div class="shell space-y-6 py-8">
        {{-- Filters + search --}}
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap gap-2">
                @foreach ($tabs as $key => $label)
                    <button type="button" wire:click="setFilter('{{ $key }}')"
                            class="{{ $filter === $key ? 'chip chip-active' : 'chip' }}">
                        {{ $label }} ({{ $counts[$key] ?? 0 }})
                    </button>
                @endforeach
            </div>
            <label class="relative lg:w-80">
                <span class="sr-only">Search orders</span>
                <x-icon name="search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                <input type="search" wire:model.live.debounce.300ms="search" placeholder="Search orders (e.g. order number, service)" class="field rounded-full py-3 pl-12 pr-4">
            </label>
        </div>

        {{-- List --}}
        @forelse ($orders as $order)
            <x-card padding="p-4 sm:p-5" wire:key="order-{{ $order->id }}">
                <div class="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                    {{-- thumb --}}
                    <span class="h-28 w-full overflow-hidden rounded-2xl sm:h-24 lg:h-20 lg:w-24">
                        <x-image-slot :key="$order->service_image_key" ratio="16/10" rounded="rounded-2xl" :alt="$order->service_name" />
                    </span>

                    {{-- middle --}}
                    <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs text-ink-muted">{{ $order->order_code }}</span>
                            <x-status-badge :status="$order->status->value" />
                        </div>
                        <h3 class="mt-0.5 font-display text-lg font-semibold text-plum">{{ $order->service_name }}</h3>
                        <p class="text-sm text-ink-soft">{{ $order->service_tagline }}</p>

                        <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-muted">
                            <span class="inline-flex items-center gap-1.5"><x-icon name="tag" class="h-3.5 w-3.5" /> {{ $order->service_name }}</span>
                            <span class="inline-flex items-center gap-1.5"><x-icon name="calendar" class="h-3.5 w-3.5" /> {{ optional($order->placed_at)->format('M j, Y, g:i A') }}</span>
                        </div>

                        @if ($order->status === \App\Enums\OrderStatus::InProgress && $order->progress_target > 0)
                            <div class="mt-3 max-w-md">
                                <div class="flex items-center justify-between text-xs text-ink-soft">
                                    <span>{{ $order->progress_current }} / {{ $order->progress_target }} {{ $order->progress_unit }}</span>
                                    <span class="font-semibold text-primary">{{ $order->progressPercent() }}%</span>
                                </div>
                                <div class="mt-1 h-2 overflow-hidden rounded-full bg-blush">
                                    <div class="h-full rounded-full" style="width: {{ $order->progressPercent() }}%; background-image:linear-gradient(90deg,#C43C6E,#E86A9A)"></div>
                                </div>
                                @if ($order->guardian_name)
                                    <p class="mt-1.5 flex items-center gap-1.5 text-xs text-ink-soft"><x-icon name="profile" class="h-3.5 w-3.5" /> Guardian · <span class="font-medium text-plum">{{ $order->guardian_name }}</span></p>
                                @endif
                            </div>
                        @elseif ($order->status === \App\Enums\OrderStatus::AwaitingGuardian)
                            <div class="mt-3 max-w-md rounded-2xl bg-blush-soft px-3 py-2 text-xs text-ink-soft">
                                We're finding the right Guardian for your order. We'll notify you as soon as someone accepts it.
                            </div>
                        @elseif ($order->status === \App\Enums\OrderStatus::Completed)
                            <div class="mt-3 max-w-md rounded-2xl bg-success-soft px-3 py-2 text-xs text-success">
                                This journey is complete! Thank you for spreading kindness.
                            </div>
                        @endif
                    </div>

                    {{-- right --}}
                    <div class="flex flex-col items-stretch gap-2 lg:items-end">
                        <span class="font-display text-lg font-semibold text-plum lg:text-right"><x-money :minor="$order->amount_minor" /></span>
                        <a href="{{ route('orders.show', $order) }}" class="btn-primary px-5 py-2.5 text-xs">View order <x-icon name="arrow-right" class="h-4 w-4" /></a>
                        @if ($order->status === \App\Enums\OrderStatus::Completed && ! $order->review_left)
                            <a href="{{ route('help.index') }}" class="btn-outline px-5 py-2.5 text-xs"><x-icon name="star" class="h-4 w-4" /> Leave review</a>
                        @endif
                    </div>
                </div>
            </x-card>
        @empty
            <div class="card flex flex-col items-center gap-3 p-12 text-center">
                <span class="grid h-14 w-14 place-items-center rounded-full bg-blush text-primary"><x-icon name="orders" class="h-6 w-6" /></span>
                <h3 class="font-display text-lg font-semibold text-plum">No orders here yet</h3>
                <p class="max-w-sm text-sm text-ink-soft">When you place an order it will appear here so you can track its journey.</p>
                <a href="{{ route('services.index') }}" class="btn-primary mt-1 px-6">Explore services <x-icon name="arrow-right" class="h-4 w-4" /></a>
            </div>
        @endforelse

        {{-- Help band --}}
        <x-card padding="p-6" class="flex flex-col items-center justify-between gap-4 bg-blush-soft sm:flex-row">
            <div class="text-center sm:text-left">
                <h3 class="flex items-center gap-2 font-display text-lg font-semibold text-plum"><x-icon name="headset" class="h-5 w-5 text-primary" /> Need help?</h3>
                <p class="text-sm text-ink-soft">If you have any questions about your orders, we're here for you.</p>
            </div>
            <a href="{{ route('help.index') }}" class="btn-outline"><x-icon name="mail" class="h-4 w-4" /> Contact Support</a>
        </x-card>
    </div>
</div>
