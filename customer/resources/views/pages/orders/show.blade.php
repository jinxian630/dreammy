@php
    use App\Enums\OrderStatus;
    $status = $order->status;

    // Derive the 4-step track from the order status.
    $trackState = fn (string $step) => match ($step) {
        'paid' => 'done',
        'assigned' => $status === OrderStatus::AwaitingGuardian ? 'current' : 'done',
        'progress' => match ($status) {
            OrderStatus::AwaitingGuardian => 'pending',
            OrderStatus::InProgress => 'current',
            OrderStatus::Completed => 'done',
            default => 'pending',
        },
        'completed' => $status === OrderStatus::Completed ? 'done' : 'pending',
        default => 'pending',
    };

    $steps = [
        ['label' => 'Paid', 'sub' => optional($order->paid_at)->format('M j, g:i A'), 'state' => $trackState('paid')],
        ['label' => 'Guardian assigned', 'sub' => $order->guardian_name ? optional($order->events->firstWhere('label', 'Guardian assigned'))?->happened_at?->format('M j, g:i A') : '—', 'state' => $trackState('assigned')],
        ['label' => 'In progress', 'sub' => optional($order->events->firstWhere('label', 'Service started'))?->happened_at?->format('M j, g:i A'), 'state' => $trackState('progress')],
        ['label' => 'Completed', 'sub' => optional($order->completed_at)->format('M j, g:i A') ?: '—', 'state' => $trackState('completed')],
    ];

    $timeline = $order->events->map(fn ($e) => [
        'title' => $e->label,
        'description' => $e->description,
        'time' => optional($e->happened_at)->format('M j, Y · g:i A'),
        'state' => $e->state,
    ])->all();
@endphp

<x-layouts.app :title="'Order '.$order->order_code">
    <x-hero eyebrow="My Orders" title="Order Tracking" image="hero.order-tracking" script="Kindness travels far ♡">
        Follow the journey and see how kindness brings light to the Sky.
    </x-hero>

    <div class="shell space-y-6 py-8">
        <a href="{{ route('orders.index') }}" class="inline-flex items-center gap-2 text-sm font-semibold text-primary"><x-icon name="arrow-right" class="h-4 w-4 rotate-180" /> Back to My Orders</a>

        {{-- Header + track --}}
        <x-card padding="p-5 sm:p-6">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <span class="text-sm text-ink-muted">Order {{ $order->order_code }}</span>
                <x-status-badge :status="$order->status->value" />
            </div>

            <div class="mt-4 grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center">
                <div class="flex items-center gap-4">
                    <span class="h-24 w-28 shrink-0 overflow-hidden rounded-2xl">
                        <x-image-slot :key="$order->service_image_key" ratio="7/6" rounded="rounded-2xl" :alt="$order->service_name" />
                    </span>
                    <div>
                        <h1 class="font-display text-2xl font-semibold text-plum">{{ $order->service_name }}</h1>
                        <p class="text-sm text-ink-soft">{{ $order->service_tagline }}</p>
                        <div class="mt-2 space-y-0.5 text-xs text-ink-muted">
                            <p class="inline-flex items-center gap-1.5"><x-icon name="tag" class="h-3.5 w-3.5" /> {{ $order->service_name }}</p><br>
                            <p class="inline-flex items-center gap-1.5"><x-icon name="calendar" class="h-3.5 w-3.5" /> {{ optional($order->placed_at)->format('M j, Y, g:i A') }}</p>
                        </div>
                    </div>
                </div>

                <div>
                    @if ($order->progress_target > 0)
                        <div class="mb-3">
                            <div class="flex items-center justify-between text-sm">
                                <span class="font-semibold text-plum">{{ $order->progress_current }} / {{ $order->progress_target }} {{ $order->progress_unit }}</span>
                                <span class="font-semibold text-primary">{{ $order->progressPercent() }}%</span>
                            </div>
                            <div class="mt-1.5 h-2.5 overflow-hidden rounded-full bg-blush">
                                <div class="h-full rounded-full" style="width: {{ $order->progressPercent() }}%; background-image:linear-gradient(90deg,#C43C6E,#E86A9A)"></div>
                            </div>
                        </div>
                    @endif
                    <x-progress-steps :steps="$steps" />
                </div>
            </div>
        </x-card>

        {{-- Guardian + summary --}}
        <div class="grid gap-6 lg:grid-cols-3">
            <x-card padding="p-5 sm:p-6" class="lg:col-span-2">
                <div class="mb-4 flex items-center gap-2"><x-icon name="shield" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Your Guardian</h2></div>
                @if ($order->guardian_name)
                    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex items-center gap-4">
                            <span class="h-16 w-16 shrink-0 overflow-hidden rounded-full">
                                <x-image-slot :key="$order->guardian_avatar_key ?? 'avatar.guardian-luna'" ratio="1/1" rounded="rounded-full" :alt="$order->guardian_name" />
                            </span>
                            <div>
                                <p class="flex items-center gap-1.5 font-display text-lg font-semibold text-plum">{{ $order->guardian_name }} <x-icon name="sparkle" :filled="true" class="h-4 w-4 text-gold" /></p>
                                @if ($order->guardian_note)<p class="text-sm text-ink-soft">{{ $order->guardian_note }}</p>@endif
                                <div class="mt-1 flex flex-wrap items-center gap-3 text-xs">
                                    @if ($order->guardian_online)<span class="inline-flex items-center gap-1 text-success"><span class="h-2 w-2 rounded-full bg-success"></span> Online now</span>@endif
                                    <span class="inline-flex items-center gap-1 text-primary"><x-icon name="heart" :filled="true" class="h-3.5 w-3.5" /> Trusted Guardian</span>
                                </div>
                            </div>
                        </div>
                        <a href="{{ route('help.index') }}" class="btn-primary shrink-0 px-5"><x-icon name="mail" class="h-4 w-4" /> Contact Guardian</a>
                    </div>
                @else
                    <div class="rounded-2xl bg-blush-soft px-4 py-4 text-sm text-ink-soft">
                        We're finding the right Guardian for your order. You'll be notified as soon as someone accepts it.
                    </div>
                @endif
            </x-card>

            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center gap-2"><x-icon name="document" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Order Summary</h2></div>
                <dl class="space-y-2 text-sm">
                    <div class="flex justify-between gap-3"><dt class="text-ink-soft">Order number</dt><dd class="font-medium text-plum">{{ $order->order_code }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-ink-soft">Service</dt><dd class="font-medium text-plum">{{ $order->service_name }}</dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-ink-soft">Price</dt><dd class="font-medium text-plum"><x-money :minor="$order->amount_minor" /></dd></div>
                    <div class="flex justify-between gap-3"><dt class="text-ink-soft">Order date</dt><dd class="font-medium text-plum">{{ optional($order->placed_at)->format('M j, Y, g:i A') }}</dd></div>
                    <div class="flex items-center justify-between gap-3"><dt class="text-ink-soft">Status</dt><dd><x-status-badge :status="$order->status->value" /></dd></div>
                </dl>
            </x-card>
        </div>

        {{-- Timeline + screenshots --}}
        <div class="grid gap-6 lg:grid-cols-2">
            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center gap-2"><x-icon name="sparkle" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Journey Timeline</h2></div>
                @if (count($timeline))
                    <x-timeline :events="$timeline" />
                @else
                    <p class="text-sm text-ink-soft">Your journey updates will appear here.</p>
                @endif
            </x-card>

            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center gap-2"><x-icon name="image" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Sample Progress Screenshots</h2></div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <x-image-slot key="evidence.before" ratio="16/9" :alt="'Before sample'" />
                        <p class="mt-2 text-sm font-medium text-plum">Before (Sample)</p>
                        <p class="text-xs text-ink-muted">{{ $order->progress_unit ? ucfirst($order->progress_unit) : 'Count' }}: 0 / {{ $order->progress_target ?: '—' }}</p>
                    </div>
                    <div>
                        <x-image-slot key="evidence.latest" ratio="16/9" :alt="'Latest progress sample'" />
                        <p class="mt-2 text-sm font-medium text-plum">Latest Progress (Sample)</p>
                        <p class="text-xs text-ink-muted">{{ $order->progress_unit ? ucfirst($order->progress_unit) : 'Count' }}: {{ $order->progress_current }} / {{ $order->progress_target ?: '—' }}</p>
                    </div>
                </div>
            </x-card>
        </div>

        {{-- Requirements / expected / help --}}
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <x-card padding="p-5">
                <div class="mb-2 flex items-center gap-2"><x-icon name="document" class="h-5 w-5 text-primary" /><h3 class="font-semibold text-plum">Service Requirements</h3></div>
                <p class="text-sm text-ink-soft">Please provide access according to our guidance. Keep your account safe.</p>
            </x-card>
            <x-card padding="p-5">
                <div class="mb-2 flex items-center gap-2"><x-icon name="calendar" class="h-5 w-5 text-primary" /><h3 class="font-semibold text-plum">Expected Completion</h3></div>
                @if ($order->expected_at)
                    <p class="text-sm text-ink-soft">By {{ $order->expected_at->format('M j, Y') }}</p>
                    <p class="font-display text-lg font-semibold text-plum">{{ $order->expected_at->format('g:i A') }}</p>
                @else
                    <p class="text-sm text-ink-soft">We'll notify you once completed.</p>
                @endif
            </x-card>
            <x-card padding="p-5">
                <div class="mb-2 flex items-center gap-2"><x-icon name="headset" class="h-5 w-5 text-primary" /><h3 class="font-semibold text-plum">Need Help?</h3></div>
                <p class="text-sm text-ink-soft">Questions about this order? We're here for you.</p>
                <a href="{{ route('help.index') }}" class="btn-outline mt-3 w-full px-4 py-2 text-xs"><x-icon name="mail" class="h-4 w-4" /> Contact Support</a>
            </x-card>
        </div>

        {{-- Completion report --}}
        <div class="relative isolate overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6">
            <div class="flex items-start gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-primary"><x-icon name="{{ $order->status === OrderStatus::Completed ? 'check-circle' : 'hourglass' }}" class="h-5 w-5" /></span>
                <div>
                    <h3 class="flex items-center gap-2 font-display text-lg font-semibold text-plum">Completion Report</h3>
                    @if ($order->status === OrderStatus::Completed)
                        <p class="text-sm text-ink-soft">This journey is complete. Thank you for spreading kindness across the Sky. <span class="text-primary">♡</span></p>
                    @else
                        <p class="text-sm text-ink-soft">Once the service is completed, {{ $order->guardian_name ?? 'your Guardian' }} will share a full report with final screenshots and details.</p>
                    @endif
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>
