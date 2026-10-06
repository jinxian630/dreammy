<?php

namespace App\Livewire\Account;

use App\Exceptions\InsufficientPointsException;
use App\Models\RewardItem;
use App\Services\PointsService;
use Livewire\Attributes\Title;
use Livewire\Component;
use RuntimeException;

#[Title('Star Rewards')]
class RewardsCenter extends Component
{
    public bool $showHistory = false;

    public function redeem(int $rewardId, PointsService $points): void
    {
        $reward = RewardItem::findOrFail($rewardId);

        try {
            $points->redeem(auth()->user(), $reward);
            session()->flash('success', "Redeemed '{$reward->name}'! We'll be in touch to apply it.");
        } catch (InsufficientPointsException $e) {
            $this->addError('redeem', $e->getMessage());
        } catch (RuntimeException $e) {
            $this->addError('redeem', $e->getMessage());
        }
    }

    public function render()
    {
        $user = auth()->user();

        return view('livewire.account.rewards-center', [
            'points' => $user->star_points,
            'rewards' => RewardItem::with('service')->where('is_available', true)->orderBy('sort')->get(),
            'history' => $this->showHistory
                ? $user->pointTransactions()->latest('created_at')->take(15)->get()
                : collect(),
        ]);
    }
}
