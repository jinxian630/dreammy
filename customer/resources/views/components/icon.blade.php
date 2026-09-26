@props(['name' => 'sparkle', 'filled' => false])

@php
    $classes = $attributes->get('class', 'w-5 h-5');
    $stroke = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
@endphp

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {{ $attributes->merge(['class' => $classes]) }} aria-hidden="true">
@switch($name)
    @case('home')
        <path {!! $stroke !!} d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>
        @break
    @case('services')
        <path {!! $stroke !!} d="M4 5h6v6H4zM14 5h6v6h-6zM4 15h6v4H4zM14 13h6v6h-6z"/>
        @break
    @case('orders')
        <path {!! $stroke !!} d="M6 3h9l3 3v15a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 8h6M9 12h6M9 16h4"/>
        @break
    @case('rewards')
        <path {!! $stroke !!} d="M4 8h16v3H4zM5 11h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM12 8v13M12 8S9.5 3.5 7.5 5 12 8 12 8zM12 8s2.5-4.5 4.5-3S12 8 12 8z"/>
        @break
    @case('profile')
        <path {!! $stroke !!} d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0"/>
        @break
    @case('bell')
        <path {!! $stroke !!} d="M18 8a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0"/>
        @break
    @case('wallet')
        <path {!! $stroke !!} d="M4 7c0-1 1-2 2-2h11a1 1 0 0 1 1 1v2M3 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM16 13h2"/>
        @break
    @case('bag')
        <path {!! $stroke !!} d="M6 8h12l-1 12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zM9 8V6a3 3 0 0 1 6 0v2"/>
        @break
    @case('search')
        <path {!! $stroke !!} d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4-4"/>
        @break
    @case('chevron-right')
        <path {!! $stroke !!} d="m9 6 6 6-6 6"/>
        @break
    @case('chevron-down')
        <path {!! $stroke !!} d="m6 9 6 6 6-6"/>
        @break
    @case('arrow-right')
        <path {!! $stroke !!} d="M4 12h16M14 6l6 6-6 6"/>
        @break
    @case('menu')
        <path {!! $stroke !!} d="M4 7h16M4 12h16M4 17h16"/>
        @break
    @case('close')
        <path {!! $stroke !!} d="M6 6l12 12M18 6 6 18"/>
        @break
    @case('star')
        <path fill="{{ $filled ? 'currentColor' : 'none' }}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M12 3.5 9.4 8.8l-5.9.9 4.3 4.1-1 5.8 5.2-2.7 5.2 2.7-1-5.8 4.3-4.1-5.9-.9z"/>
        @break
    @case('sparkle')
        <path fill="{{ $filled ? 'currentColor' : 'none' }}" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" d="M12 3c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z"/>
        @break
    @case('heart')
        <path fill="{{ $filled ? 'currentColor' : 'none' }}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" d="M12 20s-7-4.3-9.2-8.4C1.3 8.7 2.8 5.5 6 5.5c2 0 3.2 1.3 4 2.5.8-1.2 2-2.5 4-2.5 3.2 0 4.7 3.2 3.2 6.1C19 15.7 12 20 12 20z"/>
        @break
    @case('shield')
        <path {!! $stroke !!} d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6zM9.5 12l1.8 1.8L15 10"/>
        @break
    @case('check')
        <path {!! $stroke !!} d="M5 12.5 10 17l9-10"/>
        @break
    @case('check-circle')
        <path {!! $stroke !!} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12l2.3 2.3L15.5 9.5"/>
        @break
    @case('clock')
        <path {!! $stroke !!} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2"/>
        @break
    @case('hourglass')
        <path {!! $stroke !!} d="M7 3h10M7 21h10M7 3c0 5 10 5 10 0M7 21c0-5 10-5 10 0"/>
        @break
    @case('plus')
        <path {!! $stroke !!} d="M12 5v14M5 12h14"/>
        @break
    @case('minus')
        <path {!! $stroke !!} d="M5 12h14"/>
        @break
    @case('plus-circle')
        <path {!! $stroke !!} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v8M8 12h8"/>
        @break
    @case('bank')
        <path {!! $stroke !!} d="M4 10 12 4l8 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/>
        @break
    @case('card')
        <path {!! $stroke !!} d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM2 10h20M6 15h4"/>
        @break
    @case('mail')
        <path {!! $stroke !!} d="M3 6h18a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7l9 6 9-6"/>
        @break
    @case('lock')
        <path {!! $stroke !!} d="M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM8 11V8a4 4 0 0 1 8 0v3"/>
        @break
    @case('phone')
        <path {!! $stroke !!} d="M7 4h10a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM11 17h2"/>
        @break
    @case('monitor')
        <path {!! $stroke !!} d="M3 5h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM9 20h6M12 16v4"/>
        @break
    @case('headset')
        <path {!! $stroke !!} d="M4 13v-1a8 8 0 0 1 16 0v1M4 13h2a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM20 13h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2zM17 19a4 4 0 0 1-4 3h-1"/>
        @break
    @case('logout')
        <path {!! $stroke !!} d="M15 12H4M8 8l-4 4 4 4M9 4h9a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H9"/>
        @break
    @case('edit')
        <path {!! $stroke !!} d="M4 20h4L18 10l-4-4L4 16zM14 6l4 4"/>
        @break
    @case('filter')
        <path {!! $stroke !!} d="M3 5h18l-7 8v6l-4 2v-8z"/>
        @break
    @case('image')
        <path {!! $stroke !!} d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM8 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM5 18l5-5 3 3 3-3 4 4"/>
        @break
    @case('calendar')
        <path {!! $stroke !!} d="M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM4 9h16M8 3v4M16 3v4"/>
        @break
    @case('tag')
        <path {!! $stroke !!} d="M4 4h7l9 9-7 7-9-9zM8 8h.01"/>
        @break
    @case('globe')
        <path {!! $stroke !!} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18"/>
        @break
    @case('users')
        <path {!! $stroke !!} d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5.5a3 3 0 0 1 0 5.5M21 20a6 6 0 0 0-4-5.6"/>
        @break
    @case('refresh')
        <path {!! $stroke !!} d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"/>
        @break
    @case('megaphone')
        <path {!! $stroke !!} d="M4 10v4a1 1 0 0 0 1 1h2l6 4V5L7 9H5a1 1 0 0 0-1 1zM17 8a5 5 0 0 1 0 8"/>
        @break
    @case('document')
        <path {!! $stroke !!} d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v4h4M9 13h6M9 17h6"/>
        @break
    @case('compass')
        <path {!! $stroke !!} d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5 13 13l-4.5 2.5L11 11z"/>
        @break
    @case('gift')
        <path {!! $stroke !!} d="M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM3 8h18v3H3zM12 8v13M12 8S10 3.5 8 5s4 3 4 3zm0 0s2-4.5 4-3-4 3-4 3z"/>
        @break
    @default
        <path fill="currentColor" d="M12 3c.6 4.2 1.8 5.4 6 6-4.2.6-5.4 1.8-6 6-.6-4.2-1.8-5.4-6-6 4.2-.6 5.4-1.8 6-6z"/>
@endswitch
</svg>
