@props(['title' => null])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $title ? $title.' · '.config('app.name') : config('app.name') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="min-h-screen bg-cream-page font-sans text-ink">
    <div class="grid min-h-screen lg:grid-cols-2">
        {{-- Brand / artwork panel --}}
        <div class="relative hidden overflow-hidden bg-gradient-to-br from-blush-soft via-cream to-lavender-soft lg:block">
            <x-image-slot key="hero.home" ratio="3/4" rounded="rounded-none" alt="Dreammy" class="absolute inset-0 h-full w-full" />
            <div class="absolute inset-0 bg-gradient-to-t from-plum/40 via-transparent to-transparent"></div>
            <div class="absolute bottom-0 left-0 p-12 text-white">
                <p class="font-script text-3xl">Brighter journeys, together</p>
                <p class="mt-2 max-w-sm text-sm text-white/85">A kinder Sky starts with small acts of care. Welcome back, traveller.</p>
            </div>
        </div>

        {{-- Form panel --}}
        <div class="flex flex-col items-center justify-center px-6 py-10">
            <div class="w-full max-w-md">
                <div class="mb-8 flex justify-center">
                    <x-brand />
                </div>
                <div class="card p-6 sm:p-8">
                    {{ $slot }}
                </div>
                <p class="mt-6 text-center text-xs text-ink-muted">{{ config('dreammy.brand.tagline') }} · More kindness in every sky</p>
            </div>
        </div>
    </div>
    @livewireScriptConfig
</body>
</html>
