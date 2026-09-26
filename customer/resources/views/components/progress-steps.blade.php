@props(['steps' => []])

{{-- $steps: [ ['label'=>'', 'sub'=>null, 'state'=>'done|current|pending'], ... ] --}}
<ol {{ $attributes->merge(['class' => 'flex items-start']) }}>
    @foreach ($steps as $step)
        @php
            $state = $step['state'] ?? 'pending';
            $leftFilled = ! $loop->first && in_array($state, ['done', 'current']);
            $rightFilled = $state === 'done';
        @endphp
        <li class="relative flex-1">
            <div class="flex items-center">
                <span class="h-0.5 flex-1 {{ $loop->first ? 'invisible' : ($leftFilled ? 'bg-primary' : 'bg-blush-deep/60') }}"></span>

                @if ($state === 'done')
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white" style="background-image:linear-gradient(120deg,#C43C6E,#E86A9A)">
                        <x-icon name="check" class="h-4 w-4" />
                    </span>
                @elseif ($state === 'current')
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-white ring-4 ring-primary/20" style="background-image:linear-gradient(120deg,#C43C6E,#E86A9A)">
                        <x-icon name="hourglass" class="h-4 w-4" />
                    </span>
                @else
                    <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-blush-deep bg-white text-xs font-semibold text-ink-muted">{{ $loop->iteration }}</span>
                @endif

                <span class="h-0.5 flex-1 {{ $loop->last ? 'invisible' : ($rightFilled ? 'bg-primary' : 'bg-blush-deep/60') }}"></span>
            </div>
            <div class="mt-2 px-1 text-center">
                <p class="text-xs font-semibold sm:text-sm {{ $state === 'pending' ? 'text-ink-muted' : 'text-plum' }}">{{ $step['label'] }}</p>
                @if (! empty($step['sub']))
                    <p class="text-[11px] text-ink-muted">{{ $step['sub'] }}</p>
                @endif
            </div>
        </li>
    @endforeach
</ol>
