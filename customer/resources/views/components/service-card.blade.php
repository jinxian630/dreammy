@props(['service'])

<div {{ $attributes->merge(['class' => 'card group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift']) }}>
    <x-image-slot :key="$service->image_key" ratio="16/10" rounded="rounded-none" :alt="$service->name" />
    <div class="flex flex-1 flex-col p-5">
        <h3 class="font-display text-lg font-semibold text-plum">{{ $service->name }}</h3>
        <p class="mt-1 line-clamp-2 text-sm text-ink-soft">{{ $service->tagline }}</p>
        <div class="mt-4 flex items-center justify-between gap-3">
            <span class="text-lg font-semibold text-primary"><x-money :minor="$service->price_minor" /></span>
            <a href="{{ route('services.show', $service) }}" class="btn-outline px-4 py-2 text-xs">
                View service <x-icon name="arrow-right" class="h-4 w-4" />
            </a>
        </div>
    </div>
</div>
