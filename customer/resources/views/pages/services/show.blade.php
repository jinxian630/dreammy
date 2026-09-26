@php
    $features = [
        ['icon' => 'shield', 'title' => 'Safe & Reliable', 'sub' => 'Experienced Guardians'],
        ['icon' => 'heart', 'title' => 'Save Time', 'sub' => 'Focus on what you love'],
        ['icon' => 'users', 'title' => 'Kind Community', 'sub' => 'Trusted by Sky friends'],
    ];
    $steps = [
        ['title' => 'Place Your Order', 'desc' => 'Choose your options and complete payment.'],
        ['title' => 'Our Guardians Run', 'desc' => "We'll collect on your behalf."],
        ['title' => 'Delivered', 'desc' => 'Your results will be ready in your account at the selected time.'],
    ];
@endphp

<x-layouts.app :title="$service->name">
    <div class="shell space-y-8 py-6 sm:py-8">
        {{-- Breadcrumb --}}
        <nav class="flex flex-wrap items-center gap-2 text-xs text-ink-muted" aria-label="Breadcrumb">
            <a href="{{ route('home') }}" class="hover:text-primary">Home</a>
            <x-icon name="chevron-right" class="h-3 w-3" />
            <a href="{{ route('services.index') }}" class="hover:text-primary">Services</a>
            <x-icon name="chevron-right" class="h-3 w-3" />
            <span class="text-plum">{{ $service->category?->name ?? 'Service' }}</span>
        </nav>

        {{-- Header --}}
        <div class="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div class="relative overflow-hidden rounded-3xl">
                <x-image-slot :key="$service->image_key" ratio="16/11" rounded="rounded-3xl" :alt="$service->name" />
            </div>
            <div>
                <p class="mb-1 inline-flex items-center gap-1.5 text-sm font-semibold text-berry">
                    {{ $service->category?->name ?? 'Service' }} <span>🌸</span>
                </p>
                <h1 class="font-display text-3xl font-semibold leading-tight text-plum sm:text-4xl">{{ $service->name }}</h1>
                <p class="mt-2 text-lg text-rose">{{ $service->tagline }}</p>
                <p class="mt-3 text-sm text-ink-soft sm:text-base">{{ $service->description }}</p>

                <div class="mt-5 flex flex-wrap gap-4">
                    @foreach ($features as $f)
                        <div class="flex items-center gap-2">
                            <span class="grid h-10 w-10 place-items-center rounded-2xl bg-blush text-primary"><x-icon :name="$f['icon']" class="h-5 w-5" /></span>
                            <div>
                                <p class="text-sm font-semibold text-plum">{{ $f['title'] }}</p>
                                <p class="text-xs text-ink-muted">{{ $f['sub'] }}</p>
                            </div>
                        </div>
                    @endforeach
                </div>

                <div class="mt-5 flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-1 text-gold-deep">
                        @for ($i = 0; $i < 5; $i++)
                            <x-icon name="star" :filled="true" class="h-4 w-4" />
                        @endfor
                        <span class="ml-1 text-sm font-semibold text-plum">{{ number_format($service->rating, 1) }}</span>
                        <span class="text-sm text-ink-muted">({{ number_format($service->reviews_count) }} reviews)</span>
                    </div>
                </div>
            </div>
        </div>

        {{-- Body: configurator + details --}}
        <div class="grid gap-6 lg:grid-cols-3 lg:items-start">
            {{-- Details (order-2 on mobile, left on desktop) --}}
            <div class="order-2 space-y-4 lg:order-1 lg:col-span-1">
                <x-collapsible title="Service Inclusions" icon="check-circle" :open="true">
                    <ul class="space-y-2">
                        @foreach ($service->inclusions ?? [] as $item)
                            <li class="flex items-start gap-2 text-sm text-ink-soft">
                                <x-icon name="check-circle" class="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>{{ $item }}</span>
                            </li>
                        @endforeach
                    </ul>
                </x-collapsible>

                <x-collapsible title="How It Works" icon="sparkle" :open="true">
                    <ol class="space-y-4">
                        @foreach ($steps as $i => $step)
                            <li class="flex gap-3">
                                <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">{{ $i + 1 }}</span>
                                <div>
                                    <p class="font-semibold text-plum">{{ $step['title'] }}</p>
                                    <p class="text-sm text-ink-soft">{{ $step['desc'] }}</p>
                                </div>
                            </li>
                        @endforeach
                    </ol>
                </x-collapsible>

                <x-collapsible title="Your Account Safety" icon="shield" :open="false">
                    <p class="text-sm text-ink-soft">We never ask for your password. Our Guardians use a secure friend system to deliver results safely and respectfully.</p>
                </x-collapsible>
            </div>

            {{-- Configurator (order-1 on mobile, right on desktop) --}}
            <div class="order-1 lg:order-2 lg:col-span-2">
                <livewire:shop.service-configurator :service="$service" />
            </div>
        </div>
    </div>
</x-layouts.app>
