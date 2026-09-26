<div>
    <x-hero eyebrow="Services 🌸" title="Find your next little adventure" image="hero.services" script="Smaller services, brighter tomorrows">
        Meaningful services for a kinder sky.
    </x-hero>

    <div class="shell space-y-6 py-8">
        {{-- Search + filters --}}
        <div class="space-y-4">
            <div class="flex flex-col gap-3 sm:flex-row">
                <label class="relative flex-1">
                    <span class="sr-only">Search services</span>
                    <x-icon name="search" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-muted" />
                    <input type="search" wire:model.live.debounce.300ms="search"
                           placeholder="Search services… e.g. candles, hearts, companions…"
                           class="field rounded-full py-3 pl-12 pr-4">
                </label>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-ink-soft" for="sort">Sort by</label>
                    <select id="sort" wire:model.live="sort" class="field rounded-full py-3">
                        <option value="popular">Most Popular</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest</option>
                    </select>
                </div>
            </div>

            <div class="flex flex-wrap gap-2">
                <button type="button" wire:click="selectCategory('all')"
                        class="{{ $category === 'all' ? 'chip chip-active' : 'chip' }}">All</button>
                @foreach ($categories as $cat)
                    <button type="button" wire:click="selectCategory('{{ $cat->slug }}')"
                            class="{{ $category === $cat->slug ? 'chip chip-active' : 'chip' }}">{{ $cat->name }}</button>
                @endforeach
            </div>
        </div>

        {{-- Heading --}}
        <div class="flex items-end justify-between">
            <div>
                <h2 class="font-display text-2xl font-semibold text-plum">Our Services <span class="text-lg">🌸</span></h2>
                <p class="text-sm text-ink-soft">Small services. Big moments.</p>
            </div>
            <p class="text-sm text-ink-muted" wire:loading.remove>{{ $services->count() }} {{ Str::plural('result', $services->count()) }}</p>
            <p class="text-sm text-primary" wire:loading>Updating…</p>
        </div>

        {{-- Grid --}}
        @if ($services->isEmpty())
            <div class="card flex flex-col items-center gap-3 p-12 text-center">
                <span class="grid h-14 w-14 place-items-center rounded-full bg-blush text-primary"><x-icon name="search" class="h-6 w-6" /></span>
                <h3 class="font-display text-lg font-semibold text-plum">No services found</h3>
                <p class="max-w-sm text-sm text-ink-soft">Try a different search or category — or reach out and we'll help you find the right little adventure.</p>
                <button type="button" wire:click="$set('search', ''); $set('category', 'all')" class="btn-outline mt-1">Clear filters</button>
            </div>
        @else
            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" wire:loading.class="opacity-60">
                @foreach ($services as $service)
                    <x-service-card :service="$service" wire:key="svc-{{ $service->id }}" />
                @endforeach
            </div>
        @endif

        {{-- Need something special --}}
        <div class="card flex flex-col items-center justify-between gap-4 bg-blush-soft p-6 sm:flex-row">
            <div class="text-center sm:text-left">
                <h3 class="font-display text-lg font-semibold text-plum">Need something special?</h3>
                <p class="text-sm text-ink-soft">Can't find what you're looking for? Contact our friendly support team.</p>
            </div>
            <a href="{{ route('help.index') }}" class="btn-outline"><x-icon name="headset" class="h-4 w-4" /> Contact Support</a>
        </div>
    </div>
</div>
