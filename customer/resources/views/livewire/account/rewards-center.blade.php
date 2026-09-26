@php
    $earn = [
        ['icon' => 'bag', 'title' => 'Complete an order', 'desc' => 'Earn star points when you complete a service order.'],
        ['icon' => 'megaphone', 'title' => 'Share a review', 'desc' => 'Write a thoughtful review to earn star points.'],
    ];
    $how = [
        ['title' => 'Earn star points', 'desc' => 'Complete orders and share reviews to collect points.'],
        ['title' => 'Redeem rewards', 'desc' => 'Choose from our reward catalogue and redeem with your points.'],
        ['title' => 'Enjoy the kindness', 'desc' => 'Use your rewards and keep spreading kindness in the Sky.'],
    ];
@endphp

<div>
    <x-hero eyebrow="Star Rewards" title="Little stars, lovely rewards" image="hero.rewards" script="Kindness travels far">
        Every kind act lights up the sky. Collect stars and turn them into something special.
    </x-hero>

    <div class="shell space-y-6 py-8">
        @error('redeem')
            <div class="rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-warn">{{ $message }}</div>
        @enderror

        {{-- Points + earn --}}
        <div class="grid gap-6 lg:grid-cols-2">
            <x-card padding="p-5 sm:p-6" class="relative isolate overflow-hidden">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2 text-plum"><x-icon name="star" :filled="true" class="h-5 w-5 text-gold-deep" /><span class="font-semibold">Your Star Points</span></div>
                        <p class="mt-2 font-display text-5xl font-semibold text-plum">{{ number_format($points) }} <span class="text-lg font-normal text-ink-soft">points</span></p>
                        <p class="mt-1 max-w-xs text-sm text-ink-soft">Small kindnesses add up to brighter tomorrows.</p>
                        <button type="button" wire:click="$toggle('showHistory')" class="btn-outline mt-4 px-4 py-2 text-xs">
                            <x-icon name="document" class="h-4 w-4" /> {{ $showHistory ? 'Hide points history' : 'View points history' }}
                        </button>
                    </div>
                    <span class="hidden h-28 w-32 shrink-0 overflow-hidden rounded-2xl sm:block">
                        <x-image-slot key="rewards.figure" ratio="8/7" rounded="rounded-2xl" alt="" />
                    </span>
                </div>

                @if ($showHistory)
                    <div class="mt-5 border-t border-blush pt-4">
                        @forelse ($history as $tx)
                            <div class="flex items-center justify-between gap-3 border-b border-blush/60 py-2 last:border-0" wire:key="pt-{{ $tx->id }}">
                                <div>
                                    <p class="text-sm font-medium text-plum">{{ $tx->description }}</p>
                                    <p class="text-xs text-ink-muted">{{ $tx->created_at->format('M j, Y') }} · {{ $tx->type->label() }}</p>
                                </div>
                                <span class="text-sm font-semibold {{ $tx->points >= 0 ? 'text-success' : 'text-primary' }}">{{ $tx->points >= 0 ? '+' : '' }}{{ number_format($tx->points) }}</span>
                            </div>
                        @empty
                            <p class="py-3 text-center text-sm text-ink-soft">No points history yet.</p>
                        @endforelse
                    </div>
                @endif
            </x-card>

            <x-card padding="p-5 sm:p-6">
                <x-section-heading icon="star" title="Earn More Points" subtitle="More kindness. More stars." />
                <div class="space-y-3">
                    @foreach ($earn as $e)
                        <div class="flex items-center gap-3 rounded-2xl border border-blush/70 p-4">
                            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush text-primary"><x-icon :name="$e['icon']" class="h-5 w-5" /></span>
                            <div class="min-w-0 flex-1">
                                <p class="font-semibold text-plum">{{ $e['title'] }}</p>
                                <p class="text-sm text-ink-soft">{{ $e['desc'] }}</p>
                            </div>
                            <x-icon name="chevron-right" class="h-5 w-5 text-ink-muted" />
                        </div>
                    @endforeach
                </div>
            </x-card>
        </div>

        {{-- Catalogue + how it works --}}
        <div class="grid gap-6 lg:grid-cols-3">
            <div class="lg:col-span-2">
                <x-section-heading icon="gift" title="Rewards Catalogue" subtitle="Turn your star points into little joys." />
                <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    @foreach ($rewards as $reward)
                        @php $affordable = $points >= $reward->points_cost; @endphp
                        <x-card padding="p-0" class="flex flex-col overflow-hidden" wire:key="rw-{{ $reward->id }}">
                            <x-image-slot :key="$reward->image_key" ratio="16/10" rounded="rounded-none" :alt="$reward->name" />
                            <div class="flex flex-1 flex-col p-4">
                                <h3 class="font-display text-base font-semibold text-plum">{{ $reward->name }}</h3>
                                <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ $reward->description }}</p>
                                <div class="mt-3 flex items-center gap-1.5 text-sm font-semibold text-plum">
                                    <x-icon name="star" :filled="true" class="h-4 w-4 text-gold-deep" /> {{ number_format($reward->points_cost) }} points
                                </div>
                                @if ($affordable)
                                    <button type="button" wire:click="redeem({{ $reward->id }})" wire:loading.attr="disabled"
                                            class="btn-primary mt-3 w-full py-2.5 text-sm">Redeem</button>
                                @else
                                    <button type="button" disabled class="btn mt-3 w-full cursor-not-allowed bg-cream-deep py-2.5 text-sm text-ink-muted">Not enough points</button>
                                @endif
                            </div>
                        </x-card>
                    @endforeach
                </div>
            </div>

            <x-card padding="p-5 sm:p-6">
                <x-section-heading icon="document" title="How Rewards Work" />
                <ol class="space-y-4">
                    @foreach ($how as $i => $step)
                        <li class="flex gap-3">
                            <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{{ $i + 1 }}</span>
                            <div>
                                <p class="font-semibold text-plum">{{ $step['title'] }}</p>
                                <p class="text-sm text-ink-soft">{{ $step['desc'] }}</p>
                            </div>
                        </li>
                    @endforeach
                </ol>
                <div class="mt-4 space-y-2 border-t border-blush pt-4">
                    <a href="{{ route('help.index') }}" class="flex items-center justify-between text-sm text-primary"><span class="inline-flex items-center gap-2"><x-icon name="clock" class="h-4 w-4" /> Points expiry</span><x-icon name="chevron-right" class="h-4 w-4" /></a>
                    <a href="#" class="flex items-center justify-between text-sm text-primary"><span class="inline-flex items-center gap-2"><x-icon name="document" class="h-4 w-4" /> Terms &amp; Conditions</span><x-icon name="chevron-right" class="h-4 w-4" /></a>
                </div>
            </x-card>
        </div>
    </div>
</div>
