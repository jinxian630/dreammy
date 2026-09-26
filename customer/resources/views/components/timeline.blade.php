@props(['events' => []])

{{-- $events: [ ['title'=>, 'description'=>, 'time'=>, 'state'=>'done|current|pending'], ... ] --}}
<ol {{ $attributes->merge(['class' => 'relative space-y-6']) }}>
    @foreach ($events as $event)
        @php $state = $event['state'] ?? 'pending'; @endphp
        <li class="relative flex gap-4">
            <div class="flex flex-col items-center">
                @if ($state === 'done')
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style="background-image:linear-gradient(120deg,#3F9D6B,#5FB588)">
                        <x-icon name="check" class="h-4 w-4" />
                    </span>
                @elseif ($state === 'current')
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ring-4 ring-primary/20" style="background-image:linear-gradient(120deg,#C43C6E,#E86A9A)">
                        <x-icon name="hourglass" class="h-4 w-4" />
                    </span>
                @else
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-blush-deep bg-white text-ink-muted">
                        <x-icon name="clock" class="h-4 w-4" />
                    </span>
                @endif
                @unless ($loop->last)
                    <span class="mt-1 w-0.5 flex-1 {{ $state === 'done' ? 'bg-success/40' : 'bg-blush-deep/50' }}"></span>
                @endunless
            </div>
            <div class="{{ $state === 'current' ? 'rounded-2xl bg-blush-soft px-4 py-3' : 'pb-1' }} -mt-0.5 flex-1">
                @if (! empty($event['time']))
                    <p class="text-[11px] font-medium text-ink-muted">{{ $event['time'] }}</p>
                @endif
                <p class="font-semibold text-plum">{{ $event['title'] }}</p>
                @if (! empty($event['description']))
                    <p class="mt-0.5 text-sm text-ink-soft">{{ $event['description'] }}</p>
                @endif
            </div>
        </li>
    @endforeach
</ol>
