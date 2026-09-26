@props([
    'key' => null,
    'src' => null,
    'alt' => '',
    'ratio' => '16/9',
    'rounded' => 'rounded-2xl',
    'cover' => true,
])

@php
    $map = config('dreammy.images', []);
    $path = $src ?? ($key ? ($map[$key] ?? null) : null);
    $exists = $path && file_exists(public_path($path));
    $fit = $cover ? 'object-cover' : 'object-contain';
@endphp

@if ($exists)
    <img
        src="{{ asset($path) }}"
        alt="{{ $alt }}"
        loading="lazy"
        style="aspect-ratio: {{ $ratio }};"
        {{ $attributes->merge(['class' => "block w-full {$fit} {$rounded}"]) }}
    >
@else
    {{-- Empty, layout-stable placeholder: no broken icon, no dev text, correct aspect ratio --}}
    <span
        role="img"
        aria-label="{{ $alt }}"
        style="aspect-ratio: {{ $ratio }};"
        {{ $attributes->merge(['class' => "image-slot-empty {$rounded}"]) }}
    ></span>
@endif
