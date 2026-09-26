<?php

namespace App\Livewire\Account;

use App\Services\WalletService;
use Livewire\Attributes\Title;
use Livewire\Component;

#[Title('Dream Wallet')]
class WalletManager extends Component
{
    /** Selected preset in MYR (major units), or null when using a custom amount. */
    public ?int $preset = 50;

    public string $custom = '';

    public string $method = 'online_banking';

    public bool $showAllTransactions = false;

    public array $presets = [10, 30, 50, 100];

    public function selectPreset(int $value): void
    {
        $this->preset = $value;
        $this->custom = '';
    }

    public function updatedCustom(): void
    {
        if ($this->custom !== '') {
            $this->preset = null;
        }
    }

    private function amountMinor(): int
    {
        $major = $this->custom !== '' ? (float) $this->custom : (float) ($this->preset ?? 0);

        return (int) round($major * 100);
    }

    public function topUp(WalletService $wallet)
    {
        $amount = $this->amountMinor();

        $this->validate(
            ['method' => 'required|in:online_banking,ewallet'],
        );

        if ($amount < 100) {
            $this->addError('custom', 'Please choose or enter an amount of at least RM 1.00.');

            return;
        }
        if ($amount > 500000) {
            $this->addError('custom', 'For this demo, top-ups are capped at RM 5,000.');

            return;
        }

        // DEV-ONLY mock deposit — see WalletService. Not proof of real payment.
        $wallet->mockTopUp(auth()->user(), $amount, $this->method);

        $this->reset('custom');
        $this->preset = 50;

        session()->flash('success', 'Wallet topped up successfully (development mock).');
    }

    public function withdraw(): void
    {
        session()->flash('success', 'Withdrawals are reviewed before processing. This is not enabled in the demo yet.');
    }

    public function render()
    {
        $user = auth()->user();
        $query = $user->walletTransactions()->latest('created_at');

        return view('livewire.account.wallet-manager', [
            'balanceMinor' => $user->walletBalanceMinor(),
            'pendingMinor' => $user->pendingWithdrawalMinor(),
            'transactions' => $this->showAllTransactions ? $query->get() : $query->take(4)->get(),
        ]);
    }
}
