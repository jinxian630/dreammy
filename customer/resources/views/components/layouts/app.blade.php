@props(['title' => null])

@php
    $user = auth()->user();
    $walletMinor = $user?->walletBalanceMinor() ?? 0;
    $points = $user?->star_points ?? 0;

    $navLinks = [
        ['label' => 'Home', 'route' => 'home', 'active' => 'home'],
        ['label' => 'Services', 'route' => 'services.index', 'active' => 'services.*'],
        ['label' => 'My Orders', 'route' => 'orders.index', 'active' => 'orders.*'],
        ['label' => 'Rewards', 'route' => 'rewards.index', 'active' => 'rewards.*'],
    ];

    $bottomNav = [
        ['label' => 'Home', 'route' => 'home', 'active' => 'home', 'icon' => 'home'],
        ['label' => 'Services', 'route' => 'services.index', 'active' => 'services.*', 'icon' => 'services'],
        ['label' => 'Orders', 'route' => 'orders.index', 'active' => 'orders.*', 'icon' => 'orders'],
        ['label' => 'Rewards', 'route' => 'rewards.index', 'active' => 'rewards.*', 'icon' => 'rewards'],
        ['label' => 'Profile', 'route' => 'profile.show', 'active' => 'profile.*', 'icon' => 'profile'],
    ];
@endphp

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

    {{-- ============ Desktop top nav ============ --}}
    <header class="sticky top-0 z-40 hidden border-b border-blush/60 bg-cream-page/85 backdrop-blur lg:block">
        <div class="shell flex h-20 items-center justify-between gap-6">
            <x-brand />
            <nav class="flex items-center gap-1" aria-label="Primary">
                @foreach ($navLinks as $link)
                    <a href="{{ route($link['route']) }}"
                       @class([
                           'rounded-full px-4 py-2 text-sm font-semibold transition',
                           'text-primary' => request()->routeIs($link['active']),
                           'text-ink-soft hover:text-primary' => ! request()->routeIs($link['active']),
                       ])
                       @if(request()->routeIs($link['active'])) aria-current="page" @endif>
                        {{ $link['label'] }}
                    </a>
                @endforeach
            </nav>
            <div class="flex items-center gap-3">
                @auth
                    <a href="{{ route('wallet.index') }}" class="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white px-4 py-2 text-sm font-semibold text-plum shadow-soft">
                        <x-icon name="bag" class="h-4 w-4 text-gold-deep" />
                        <x-money :minor="$walletMinor" />
                    </a>
                    <a href="{{ route('help.index') }}" class="relative grid h-11 w-11 place-items-center rounded-full border border-blush bg-white text-plum hover:text-primary" aria-label="Notifications">
                        <x-icon name="bell" class="h-5 w-5" />
                        <span class="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary"></span>
                    </a>
                    <div x-data="{ open: false }" @keydown.escape.stop.prevent="open = false; $refs.accountTrigger.focus()" class="relative shrink-0">
                        <button type="button" x-ref="accountTrigger" @click="open = !open"
                                :aria-expanded="open.toString()" aria-controls="account-dropdown"
                                :class="{ 'bg-blush-soft border-primary': open }"
                                class="flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-white p-1 pl-3 pr-2 text-plum shadow-soft transition hover:border-primary hover:bg-blush-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                aria-label="Account menu">
                            <span class="hidden h-9 w-9 overflow-hidden rounded-full xl:block">
                                <x-image-slot :key="$user->avatar_key ?? 'avatar.user'" ratio="1/1" rounded="rounded-full" alt="Your avatar" />
                            </span>
                            <span class="text-sm font-semibold">Account</span>
                            <span class="grid h-8 w-8 place-items-center rounded-full bg-blush text-plum transition-transform" :class="{ 'rotate-180': open }">
                                <x-icon name="chevron-down" class="h-5 w-5" />
                            </span>
                        </button>
                        <div id="account-dropdown" x-show="open" x-transition x-cloak @click.outside="open = false"
                             class="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-blush bg-white py-2 shadow-lift">
                            <a href="{{ route('profile.show') }}" class="block px-4 py-2 text-sm text-ink-soft hover:bg-blush-soft hover:text-primary">My Profile</a>
                            <a href="{{ route('wallet.index') }}" class="block px-4 py-2 text-sm text-ink-soft hover:bg-blush-soft hover:text-primary">Dream Wallet</a>
                            <a href="{{ route('help.index') }}" class="block px-4 py-2 text-sm text-ink-soft hover:bg-blush-soft hover:text-primary">Help &amp; Security</a>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <button type="submit" class="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-blush-soft">Sign out</button>
                            </form>
                        </div>
                    </div>
                @else
                    <a href="{{ route('login') }}" class="text-sm font-semibold text-ink-soft hover:text-primary">Log in</a>
                    <a href="{{ route('register') }}" class="btn-primary">Sign up</a>
                @endauth
            </div>
        </div>
    </header>

    {{-- ============ Mobile top bar ============ --}}
    <div x-data="{ menu: false }" class="lg:hidden">
        <header class="sticky top-0 z-40 border-b border-blush/60 bg-cream-page/90 backdrop-blur">
            <div class="flex h-16 items-center justify-between gap-3 px-4">
                <button @click="menu = true" class="grid h-10 w-10 place-items-center rounded-xl text-plum" aria-label="Open menu">
                    <x-icon name="menu" class="h-6 w-6" />
                </button>
                <x-brand :compact="true" />
                <div class="flex items-center gap-2">
                    @auth
                        <a href="{{ route('wallet.index') }}" class="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-white px-2.5 py-1.5 text-xs font-semibold text-plum">
                            <x-icon name="bag" class="h-3.5 w-3.5 text-gold-deep" />
                            <x-money :minor="$walletMinor" />
                        </a>
                        <a href="{{ route('help.index') }}" class="relative grid h-9 w-9 place-items-center rounded-full border border-blush bg-white text-plum" aria-label="Notifications">
                            <x-icon name="bell" class="h-5 w-5" />
                            <span class="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
                        </a>
                    @else
                        <a href="{{ route('login') }}" class="btn-outline px-4 py-2 text-xs">Log in</a>
                    @endauth
                </div>
            </div>
        </header>

        {{-- Drawer --}}
        <div x-show="menu" x-cloak class="fixed inset-0 z-50" x-transition.opacity>
            <div class="absolute inset-0 bg-plum/30" @click="menu = false"></div>
            <nav class="absolute left-0 top-0 flex h-full w-80 max-w-[85%] flex-col gap-1 bg-cream-page p-5 shadow-lift" aria-label="Mobile">
                <div class="mb-4 flex items-center justify-between">
                    <x-brand />
                    <button @click="menu = false" class="grid h-9 w-9 place-items-center rounded-xl text-plum" aria-label="Close menu">
                        <x-icon name="close" class="h-5 w-5" />
                    </button>
                </div>
                @foreach ($navLinks as $link)
                    <a href="{{ route($link['route']) }}"
                       @class([
                           'rounded-2xl px-4 py-3 text-sm font-semibold',
                           'bg-blush text-primary' => request()->routeIs($link['active']),
                           'text-ink-soft' => ! request()->routeIs($link['active']),
                       ])>{{ $link['label'] }}</a>
                @endforeach
                <div class="my-2 border-t border-blush"></div>
                @auth
                    <a href="{{ route('profile.show') }}" class="rounded-2xl px-4 py-3 text-sm font-semibold text-ink-soft">My Profile</a>
                    <a href="{{ route('help.index') }}" class="rounded-2xl px-4 py-3 text-sm font-semibold text-ink-soft">Help &amp; Security</a>
                    <form method="POST" action="{{ route('logout') }}" class="mt-auto">
                        @csrf
                        <button type="submit" class="btn-outline w-full">Sign out</button>
                    </form>
                @else
                    <a href="{{ route('login') }}" class="btn-outline w-full">Log in</a>
                    <a href="{{ route('register') }}" class="btn-primary mt-2 w-full">Sign up</a>
                @endauth
            </nav>
        </div>
    </div>

    {{-- ============ Flash ============ --}}
    @if (session('status') || session('success'))
        <div x-data="{ show: true }" x-show="show" x-init="setTimeout(() => show = false, 4000)"
             class="shell mt-4">
            <div class="flex items-center gap-3 rounded-2xl border border-success/30 bg-success-soft px-4 py-3 text-sm text-success">
                <x-icon name="check-circle" class="h-5 w-5" />
                <span>{{ session('status') ?? session('success') }}</span>
            </div>
        </div>
    @endif

    {{-- ============ Content ============ --}}
    <main class="pb-24 lg:pb-0">
        {{ $slot }}
    </main>

    {{-- ============ Footer (desktop-friendly, hidden on very small handled by layout) ============ --}}
    <footer class="mt-10 border-t border-blush/60 bg-surface">
        <div class="shell flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
            <x-brand />
            <nav class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft" aria-label="Footer">
                <a href="{{ route('help.index') }}" class="hover:text-primary">Help Center</a>
                <a href="{{ route('help.index') }}" class="hover:text-primary">Contact Us</a>
                <a href="#" class="hover:text-primary">Terms of Service</a>
                <a href="#" class="hover:text-primary">Privacy Policy</a>
            </nav>
            <div class="flex items-center gap-3 text-ink-muted">
                <span class="grid h-8 w-8 place-items-center rounded-full border border-blush"><x-icon name="megaphone" class="h-4 w-4" /></span>
                <span class="grid h-8 w-8 place-items-center rounded-full border border-blush"><x-icon name="heart" class="h-4 w-4" /></span>
                <span class="grid h-8 w-8 place-items-center rounded-full border border-blush"><x-icon name="sparkle" class="h-4 w-4" /></span>
                <span class="ml-2 font-script text-lg text-rose">More kindness in every sky</span>
            </div>
        </div>
    </footer>

    {{-- ============ Mobile bottom nav ============ --}}
    <nav class="fixed inset-x-0 bottom-0 z-40 border-t border-blush bg-cream-page/95 backdrop-blur lg:hidden"
         style="padding-bottom: env(safe-area-inset-bottom, 0px);" aria-label="Bottom">
        <div class="mx-auto grid max-w-md grid-cols-5">
            @foreach ($bottomNav as $item)
                <a href="{{ route($item['route']) }}"
                   @class([
                       'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium',
                       'text-primary' => request()->routeIs($item['active']),
                       'text-ink-muted' => ! request()->routeIs($item['active']),
                   ])
                   @if(request()->routeIs($item['active'])) aria-current="page" @endif>
                    <x-icon :name="$item['icon']" class="h-6 w-6" />
                    {{ $item['label'] }}
                </a>
            @endforeach
        </div>
    </nav>

    @livewireScriptConfig
</body>
</html>
