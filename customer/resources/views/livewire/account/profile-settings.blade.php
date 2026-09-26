@php
    $support = [
        ['icon' => 'bell', 'title' => 'Notification preferences', 'desc' => 'Manage your notification settings.', 'href' => route('help.index')],
        ['icon' => 'shield', 'title' => 'Account security', 'desc' => 'Update your password and security settings.', 'href' => route('help.index')],
        ['icon' => 'headset', 'title' => 'Help center', 'desc' => 'Find answers and get support.', 'href' => route('help.index')],
    ];
@endphp

<div>
    <x-hero eyebrow="My Profile" title="A kinder you, brighter tomorrows" image="hero.profile" script="Same kindness, further together ♡">
        Small kindnesses make a brighter sky.
    </x-hero>

    <div class="shell space-y-6 py-8">
        {{-- Profile summary --}}
        <x-card padding="p-5 sm:p-6">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-4">
                    <span class="h-20 w-20 shrink-0 overflow-hidden rounded-full ring-4 ring-blush">
                        <x-image-slot :key="$user->avatar_key ?? 'avatar.user'" ratio="1/1" rounded="rounded-full" :alt="$user->displayName()" />
                    </span>
                    <div>
                        <p class="flex items-center gap-2 font-display text-xl font-semibold text-plum">{{ $user->displayName() }} <x-icon name="edit" class="h-4 w-4 text-primary" /></p>
                        <p class="text-sm text-ink-soft">Member since {{ optional($user->member_since)->format('j M Y') ?? '—' }}</p>
                        <p class="mt-1 flex items-center gap-1.5 text-sm text-ink-soft"><x-icon name="star" :filled="true" class="h-4 w-4 text-gold-deep" /> Kindness is a light that always finds its way.</p>
                    </div>
                </div>
                <a href="#account-settings" class="btn-outline shrink-0"><x-icon name="edit" class="h-4 w-4" /> Edit Profile</a>
            </div>
        </x-card>

        {{-- Stats --}}
        <div class="grid gap-6 sm:grid-cols-2">
            <x-stat-card icon="bag" label="Orders" sublabel="View and track your service orders." :value="$ordersCount" :href="route('orders.index')" />
            <x-stat-card icon="star" tone="gold" label="Star Points" sublabel="Small kindnesses add up to brighter tomorrows." :value="number_format($points)" :href="route('rewards.index')" />
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
            {{-- Account settings --}}
            <x-card padding="p-5 sm:p-6" id="account-settings">
                <x-section-heading icon="profile" title="Account Settings" subtitle="Manage your personal information and preferences." />
                <div class="space-y-4">
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-plum">Display name</label>
                        <input type="text" wire:model="displayName" class="field rounded-2xl">
                        @error('displayName') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror
                    </div>
                    <div>
                        <label class="mb-1.5 block text-sm font-medium text-plum">Email</label>
                        <input type="email" wire:model="email" class="field rounded-2xl">
                        @error('email') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror
                    </div>
                    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label class="mb-1.5 block text-sm font-medium text-plum">Language</label>
                            <select wire:model="language" class="field rounded-2xl">
                                <option value="en">English</option>
                                <option value="ms">Bahasa Melayu</option>
                                <option value="zh">中文</option>
                            </select>
                        </div>
                        <div>
                            <label class="mb-1.5 block text-sm font-medium text-plum">Preferred currency</label>
                            <select wire:model="currency" class="field rounded-2xl">
                                <option value="MYR">MYR (Malaysian Ringgit)</option>
                                <option value="RMB">RMB (Chinese Yuan)</option>
                            </select>
                        </div>
                    </div>
                    <button type="button" wire:click="save" wire:loading.attr="disabled" class="btn-primary w-full">
                        <span wire:loading.remove wire:target="save">Save Changes</span>
                        <span wire:loading wire:target="save">Saving…</span>
                    </button>
                </div>
            </x-card>

            <div class="space-y-6">
                {{-- Favorites --}}
                <x-card padding="p-5 sm:p-6">
                    <x-section-heading icon="heart" title="Favorites" subtitle="The little things that make your journey brighter." />
                    <div class="space-y-3">
                        @forelse ($favorites as $fav)
                            <a href="{{ $fav->link ?? route('services.index') }}" class="flex items-center gap-3 rounded-2xl border border-blush/70 p-3 transition hover:border-primary/40" wire:key="fav-{{ $fav->id }}">
                                <span class="h-12 w-16 shrink-0 overflow-hidden rounded-xl"><x-image-slot :key="$fav->image_key" ratio="4/3" rounded="rounded-xl" :alt="$fav->title" /></span>
                                <div class="min-w-0 flex-1">
                                    <p class="font-semibold text-plum">{{ $fav->title }}</p>
                                    <p class="line-clamp-1 text-sm text-ink-soft">{{ $fav->description }}</p>
                                </div>
                                <x-icon name="chevron-right" class="h-5 w-5 text-ink-muted" />
                            </a>
                        @empty
                            <p class="text-sm text-ink-soft">No favorites yet.</p>
                        @endforelse
                    </div>
                </x-card>

                {{-- Notification preferences --}}
                <x-card padding="p-5 sm:p-6">
                    <x-section-heading icon="bell" title="Notification Preferences" subtitle="Choose what you'd like to hear about." />
                    <div class="space-y-3">
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-start gap-2">
                                <x-icon name="bell" class="mt-0.5 h-5 w-5 text-primary" />
                                <div><p class="font-semibold text-plum">Order updates</p><p class="text-sm text-ink-soft">Get notified about your service orders.</p></div>
                            </div>
                            <button type="button" wire:click="$toggle('notifyOrderUpdates')" role="switch" :aria-checked="@js($notifyOrderUpdates)"
                                    class="relative h-7 w-12 shrink-0 rounded-full transition {{ $notifyOrderUpdates ? 'bg-primary' : 'bg-blush-deep/60' }}">
                                <span class="absolute top-1 h-5 w-5 rounded-full bg-white transition-all {{ $notifyOrderUpdates ? 'left-6' : 'left-1' }}"></span>
                            </button>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                            <div class="flex items-start gap-2">
                                <x-icon name="heart" class="mt-0.5 h-5 w-5 text-primary" />
                                <div><p class="font-semibold text-plum">Promotions</p><p class="text-sm text-ink-soft">Receive updates about special offers and kindness events.</p></div>
                            </div>
                            <button type="button" wire:click="$toggle('notifyPromotions')" role="switch" :aria-checked="@js($notifyPromotions)"
                                    class="relative h-7 w-12 shrink-0 rounded-full transition {{ $notifyPromotions ? 'bg-primary' : 'bg-blush-deep/60' }}">
                                <span class="absolute top-1 h-5 w-5 rounded-full bg-white transition-all {{ $notifyPromotions ? 'left-6' : 'left-1' }}"></span>
                            </button>
                        </div>
                    </div>
                </x-card>
            </div>
        </div>

        {{-- Account & support + sign out --}}
        <div class="grid gap-6 lg:grid-cols-3">
            <x-card padding="p-5 sm:p-6" class="lg:col-span-2">
                <x-section-heading icon="sparkle" title="Account & Support" subtitle="More ways to keep your journey smooth." />
                <div class="grid gap-3 sm:grid-cols-3">
                    @foreach ($support as $s)
                        <a href="{{ $s['href'] }}" class="flex flex-col gap-2 rounded-2xl border border-blush/70 p-4 transition hover:border-primary/40">
                            <span class="grid h-10 w-10 place-items-center rounded-2xl bg-blush text-primary"><x-icon :name="$s['icon']" class="h-5 w-5" /></span>
                            <span class="font-semibold text-plum">{{ $s['title'] }}</span>
                            <span class="text-sm text-ink-soft">{{ $s['desc'] }}</span>
                        </a>
                    @endforeach
                </div>
            </x-card>

            <x-card padding="p-5 sm:p-6" class="flex flex-col justify-center">
                <div class="flex items-center gap-2 text-primary"><x-icon name="logout" class="h-6 w-6" /><p class="font-display text-lg font-semibold">Sign out</p></div>
                <p class="mt-1 text-sm text-ink-soft">See you again in the Sky.</p>
                <form method="POST" action="{{ route('logout') }}" class="mt-4">
                    @csrf
                    <button type="submit" class="btn-outline w-full">Sign out</button>
                </form>
            </x-card>
        </div>
    </div>
</div>
