@props(['count' => 0, 'size' => 'h-11 w-11'])

{{-- Cart icon with a live item-count badge. The badge updates without a reload
     via the `cart-updated` browser event dispatched by the cart/configurator. --}}
<a href="{{ route('cart.index') }}"
   x-data="{ count: {{ (int) $count }} }"
   x-on:cart-updated.window="count = $event.detail.count"
   class="relative grid {{ $size }} place-items-center rounded-full border border-blush bg-white text-plum transition hover:text-primary"
   aria-label="Cart">
    <x-icon name="bag" class="h-5 w-5" />
    <span x-show="count > 0" x-cloak x-text="count"
          class="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white"></span>
</a>
