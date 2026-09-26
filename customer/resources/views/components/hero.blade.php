@props([
    'eyebrow' => null,
    'title' => null,
    'image' => 'hero.home',
    'script' => null,
])

<section class="relative isolate overflow-hidden border-b border-blush/50">
    <x-image-slot :key="$image" ratio="21/9" rounded="rounded-none" alt="" class="absolute inset-0 -z-10 h-full w-full" />
    <div class="absolute inset-0 -z-10 bg-gradient-to-r from-cream-page/95 via-cream-page/75 to-cream-page/20"></div>

    <div class="shell py-10 sm:py-12 lg:py-16">
        <div class="max-w-xl">
            @isset($breadcrumb)
                <div class="mb-3 text-xs text-ink-muted">{{ $breadcrumb }}</div>
            @endisset
            @if ($eyebrow)
                <p class="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-berry">
                    <x-icon name="sparkle" :filled="true" class="h-4 w-4 text-gold-deep" />{{ $eyebrow }}
                </p>
            @endif
            @if ($title)
                <h1 class="font-display text-3xl font-semibold leading-[1.08] text-plum sm:text-4xl lg:text-5xl">{{ $title }}</h1>
            @endif
            @if (trim($slot) !== '')
                <div class="mt-3 text-sm text-ink-soft sm:text-base">{{ $slot }}</div>
            @endif
            @isset($actions)
                <div class="mt-6 flex flex-wrap gap-3">{{ $actions }}</div>
            @endisset
        </div>

        @if ($script)
            <p class="pointer-events-none absolute right-6 top-10 hidden font-script text-2xl leading-tight text-rose sm:block lg:right-12 lg:text-3xl">{{ $script }}</p>
        @endif
    </div>
</section>
