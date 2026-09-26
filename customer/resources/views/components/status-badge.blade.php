@props(['status' => 'pending', 'label' => null])

@php
    $map = [
        'in_progress'        => ['In progress', 'warn', 'clock'],
        'awaiting_guardian'  => ['Awaiting Guardian', 'info', 'hourglass'],
        'awaiting_payment'   => ['Awaiting payment', 'info', 'hourglass'],
        'paid'               => ['Paid', 'success', 'check-circle'],
        'dispatched'         => ['Dispatched', 'info', 'refresh'],
        'claimed'            => ['Guardian assigned', 'info', 'users'],
        'delivered'          => ['Delivered', 'success', 'check-circle'],
        'completed'          => ['Completed', 'success', 'check-circle'],
        'confirmed'          => ['Confirmed', 'success', 'check-circle'],
        'cancelled'          => ['Cancelled', 'muted', 'close'],
        'expired'            => ['Expired', 'muted', 'clock'],
        'refunded'           => ['Refunded', 'muted', 'refresh'],
        'disputed'           => ['Disputed', 'warn', 'megaphone'],
        'verified'           => ['Verified', 'success', 'check-circle'],
        'draft'              => ['Draft', 'muted', 'edit'],
    ];

    [$lbl, $tone, $icon] = $map[$status] ?? [ucfirst(str_replace('_', ' ', $status)), 'info', 'clock'];
    $label = $label ?? $lbl;

    $tones = [
        'success' => 'bg-success-soft text-success',
        'warn'    => 'bg-warn-soft text-warn',
        'info'    => 'bg-blush text-primary',
        'muted'   => 'bg-cream-deep text-ink-muted',
    ];
@endphp

<span {{ $attributes->merge(['class' => "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold {$tones[$tone]}"]) }}>
    <x-icon :name="$icon" class="h-3.5 w-3.5" />{{ $label }}
</span>
