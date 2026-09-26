<?php

namespace App\Livewire\Account;

use App\Enums\OrderStatus;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;

#[Title('My Orders')]
class OrdersIndex extends Component
{
    #[Url(history: true)]
    public string $filter = 'all';

    #[Url(as: 'q')]
    public string $search = '';

    public function setFilter(string $filter): void
    {
        $this->filter = $filter;
    }

    private function baseQuery()
    {
        return auth()->user()->orders()
            ->where('status', '!=', OrderStatus::Draft->value)
            ->latest('placed_at');
    }

    public function render()
    {
        $orders = $this->baseQuery()
            ->when($this->filter === 'awaiting', fn ($q) => $q->whereIn('status', [OrderStatus::AwaitingGuardian->value, OrderStatus::AwaitingPayment->value]))
            ->when($this->filter === 'in_progress', fn ($q) => $q->where('status', OrderStatus::InProgress->value))
            ->when($this->filter === 'completed', fn ($q) => $q->where('status', OrderStatus::Completed->value))
            ->when($this->search !== '', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('order_code', 'like', '%'.$this->search.'%')
                        ->orWhere('service_name', 'like', '%'.$this->search.'%');
                });
            })
            ->get();

        $counts = [
            'all' => $this->baseQuery()->count(),
            'awaiting' => (clone $this->baseQuery())->whereIn('status', [OrderStatus::AwaitingGuardian->value, OrderStatus::AwaitingPayment->value])->count(),
            'in_progress' => (clone $this->baseQuery())->where('status', OrderStatus::InProgress->value)->count(),
            'completed' => (clone $this->baseQuery())->where('status', OrderStatus::Completed->value)->count(),
        ];

        return view('livewire.account.orders-index', [
            'orders' => $orders,
            'counts' => $counts,
        ]);
    }
}
