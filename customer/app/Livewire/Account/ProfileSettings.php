<?php

namespace App\Livewire\Account;

use App\Enums\OrderStatus;
use Illuminate\Validation\Rule;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('My Profile')]
class ProfileSettings extends Component
{
    public string $displayName = '';

    public string $email = '';

    public string $language = 'en';

    public string $currency = 'MYR';

    public bool $notifyOrderUpdates = true;

    public bool $notifyPromotions = false;

    public function mount(): void
    {
        $user = auth()->user();
        $this->displayName = $user->display_name ?: $user->name;
        $this->email = $user->email;
        $this->language = $user->language ?: 'en';
        $this->currency = $user->currency ?: 'MYR';
        $this->notifyOrderUpdates = (bool) $user->notify_order_updates;
        $this->notifyPromotions = (bool) $user->notify_promotions;
    }

    public function save(): void
    {
        $user = auth()->user();

        $validated = $this->validate([
            'displayName' => ['required', 'string', 'min:2', 'max:50'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'language' => ['required', 'in:en,ms,zh'],
            'currency' => ['required', 'in:MYR,RMB'],
        ]);

        $user->update([
            'display_name' => $validated['displayName'],
            'name' => $validated['displayName'],
            'email' => $validated['email'],
            'language' => $validated['language'],
            'currency' => $validated['currency'],
        ]);

        session()->flash('success', 'Your profile has been saved.');
    }

    /** Persist notification toggles immediately when changed. */
    public function updated(string $property): void
    {
        if (in_array($property, ['notifyOrderUpdates', 'notifyPromotions'], true)) {
            auth()->user()->update([
                'notify_order_updates' => $this->notifyOrderUpdates,
                'notify_promotions' => $this->notifyPromotions,
            ]);
        }
    }

    public function render()
    {
        $user = auth()->user();

        return view('livewire.account.profile-settings', [
            'user' => $user,
            'ordersCount' => $user->orders()->where('status', '!=', OrderStatus::Draft->value)->count(),
            'points' => $user->star_points,
            'favorites' => $user->favorites()->orderBy('sort')->get(),
        ]);
    }
}
