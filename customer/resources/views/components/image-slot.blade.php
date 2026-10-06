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
    // Resolve: explicit src > mapped key > the key itself (admin stores full Storage URLs).
    $path = $src ?? ($key ? ($map[$key] ?? $key) : null);
    $isExternal = $path && (str_starts_with($path, 'http://') || str_starts_with($path, 'https://'));
    $exists = $isExternal || ($path && file_exists(public_path($path)));
    $fit = $cover ? 'object-cover' : 'object-contain';
@endphp

@if ($exists)
    <img
        src="{{ $isExternal ? $path : asset($path) }}"
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
