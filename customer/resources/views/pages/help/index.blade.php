@php
    $topics = [
        ['icon' => 'bag', 'title' => 'Ordering', 'desc' => 'Help with placing orders, changes and cancellations.'],
        ['icon' => 'wallet', 'title' => 'Payments & wallet', 'desc' => 'Top-ups, refunds, payment methods and wallet help.'],
        ['icon' => 'sparkle', 'title' => 'Service progress', 'desc' => 'Track your orders and understand service status.'],
        ['icon' => 'shield', 'title' => 'Account safety', 'desc' => 'Keep your account safe and secure.'],
    ];
@endphp

<x-layouts.app title="Help & Security">
    <div x-data="{ q: '' }">
        <div class="relative isolate overflow-hidden border-b border-blush/50">
            <x-image-slot key="hero.help" ratio="21/9" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full" />
            <div class="absolute inset-0 -z-10 bg-gradient-to-r from-cream-page/95 via-cream-page/80 to-cream-page/30"></div>
            <div class="shell py-10 lg:py-14">
                <div class="max-w-xl">
                    <p class="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-berry"><x-icon name="shield" class="h-4 w-4 text-primary" /> Help &amp; Security 🌸</p>
                    <h1 class="font-display text-3xl font-semibold leading-tight text-plum sm:text-4xl lg:text-5xl">A little care,<br>whenever you need it.</h1>
                    <p class="mt-3 text-sm text-ink-soft sm:text-base">We're here to support your journey in a kinder, safer Sky.</p>
                    <label class="relative mt-5 block">
                        <span class="sr-only">Search for help</span>
                        <x-icon name="search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                        <input type="search" x-model="q" placeholder="Search for help (e.g. orders, payments, account security…)" class="field rounded-full py-3.5 pl-12 pr-4">
                    </label>
                </div>
            </div>
        </div>

        <div class="shell space-y-10 py-10">
            {{-- How can we help --}}
            <section>
                <x-section-heading title="How can we help?" accent="Small questions. Brighter tomorrows." />
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    @foreach ($topics as $t)
                        <a href="#faqs" class="card flex items-start gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift">
                            <span class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blush text-primary"><x-icon :name="$t['icon']" class="h-5 w-5" /></span>
                            <span>
                                <span class="block font-display text-base font-semibold text-plum">{{ $t['title'] }}</span>
                                <span class="mt-0.5 block text-sm text-ink-soft">{{ $t['desc'] }}</span>
                            </span>
                        </a>
                    @endforeach
                </div>
            </section>

            {{-- FAQ + account security --}}
            <section class="grid gap-6 lg:grid-cols-2" id="faqs">
                <x-card padding="p-5 sm:p-6">
                    <x-section-heading title="Frequently asked questions" accent="🌸" />
                    <div>
                        @foreach ($faqs as $faq)
                            <div x-show="q === '' || @js(\Illuminate\Support\Str::lower($faq->question.' '.$faq->answer)).includes(q.toLowerCase())">
                                <x-faq-item :question="$faq->question" :open="$loop->first">{{ $faq->answer }}</x-faq-item>
                            </div>
                        @endforeach
                    </div>
                    <p x-show="q !== ''" x-cloak class="pt-3 text-xs text-ink-muted">Showing results for “<span x-text="q"></span>”.</p>
                </x-card>

                <x-card padding="p-5 sm:p-6">
                    <div class="mb-1 flex items-center gap-2"><x-icon name="shield" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Account security</h2></div>
                    <p class="mb-4 text-sm text-ink-soft">Simple steps for a safer, kinder journey.</p>

                    @auth
                        <div class="space-y-3">
                            <div class="flex items-center justify-between gap-3 rounded-2xl border border-blush/70 p-4">
                                <div class="flex min-w-0 items-start gap-3">
                                    <x-icon name="mail" class="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                                    <div class="min-w-0">
                                        <p class="font-semibold text-plum">Email verification</p>
                                        <p class="truncate text-sm text-ink-soft">{{ auth()->user()->email }}</p>
                                    </div>
                                </div>
                                @if (auth()->user()->email_verified_at)
                                    <span class="inline-flex items-center gap-1 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success"><x-icon name="check-circle" class="h-3.5 w-3.5" /> Verified</span>
                                @else
                                    <span class="rounded-full bg-warn-soft px-3 py-1 text-xs font-semibold text-warn">Unverified</span>
                                @endif
                            </div>

                            <a href="{{ route('password.request') }}" class="flex items-center justify-between gap-3 rounded-2xl border border-blush/70 p-4 transition hover:border-primary/40">
                                <div class="flex items-start gap-3">
                                    <x-icon name="lock" class="mt-0.5 h-5 w-5 text-primary" />
                                    <div><p class="font-semibold text-plum">Change password</p><p class="text-sm text-ink-soft">Update your password regularly to keep your account safe.</p></div>
                                </div>
                                <x-icon name="chevron-right" class="h-5 w-5 text-ink-muted" />
                            </a>

                            <div class="flex items-center justify-between gap-3 rounded-2xl border border-blush/70 p-4">
                                <div class="flex items-start gap-3">
                                    <x-icon name="phone" class="mt-0.5 h-5 w-5 text-primary" />
                                    <div><p class="font-semibold text-plum">Two-step verification</p><p class="text-sm text-ink-soft">Add an extra layer of protection to your account.</p></div>
                                </div>
                                <span class="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-ink-muted">Coming soon</span>
                            </div>

                            <div class="flex items-center justify-between gap-3 rounded-2xl border border-blush/70 p-4">
                                <div class="flex items-start gap-3">
                                    <x-icon name="monitor" class="mt-0.5 h-5 w-5 text-primary" />
                                    <div><p class="font-semibold text-plum">Active sessions</p><p class="text-sm text-ink-soft">See and manage where your account is logged in.</p></div>
                                </div>
                                <span class="rounded-full bg-cream-deep px-3 py-1 text-xs font-semibold text-ink-muted">Coming soon</span>
                            </div>
                        </div>
                    @else
                        <div class="space-y-3 text-sm text-ink-soft">
                            <p class="flex items-start gap-2"><x-icon name="check-circle" class="mt-0.5 h-4 w-4 text-primary" /> We never ask for your game password in ordinary forms.</p>
                            <p class="flex items-start gap-2"><x-icon name="check-circle" class="mt-0.5 h-4 w-4 text-primary" /> Log in to manage your email, password and active sessions.</p>
                            <a href="{{ route('login') }}" class="btn-primary mt-2">Log in</a>
                        </div>
                    @endauth
                </x-card>
            </section>

            {{-- Still need a hand --}}
            <section class="grid gap-6 lg:grid-cols-3">
                <x-card padding="p-5 sm:p-6" class="lg:col-span-2">
                    <x-section-heading title="Still need a hand?" subtitle="Send us a message and we'll get back to you as soon as possible." />
                    <livewire:support.contact-form />
                </x-card>
                <div class="relative isolate hidden overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6 lg:flex lg:flex-col lg:justify-end">
                    <x-image-slot key="banner.help-support" ratio="5/4" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full opacity-60" />
                    <div class="absolute inset-0 -z-10 bg-gradient-to-t from-blush-soft via-blush-soft/70 to-transparent"></div>
                    <p class="font-script text-2xl text-rose">Kind people, brighter skies ♡</p>
                    <p class="mt-1 text-sm text-ink-soft">“Every question brings us closer to a kinder Sky.”</p>
                </div>
            </section>

            {{-- Account cared for band --}}
            <section class="relative isolate overflow-hidden rounded-3xl border border-blush/60 bg-blush-soft p-6 sm:p-8">
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 class="font-display text-2xl font-semibold text-plum">Your account, cared for. <span class="text-primary">♡</span></h2>
                        <p class="mt-1 text-sm text-ink-soft">Helpful support. Safer journeys. Brighter together.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-6 text-sm font-medium text-plum">
                        <span class="inline-flex items-center gap-2"><x-icon name="shield" class="h-5 w-5 text-primary" /> Privacy first</span>
                        <span class="inline-flex items-center gap-2"><x-icon name="users" class="h-5 w-5 text-primary" /> Dedicated support</span>
                        <span class="inline-flex items-center gap-2"><x-icon name="sparkle" class="h-5 w-5 text-primary" /> A kinder community</span>
                    </div>
                </div>
            </section>
        </div>
    </div>
</x-layouts.app>
