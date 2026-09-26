<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\View\View;

class HomeController extends Controller
{
    public function __invoke(Request $request): View
    {
        $user = $request->user();

        $currentOrder = $user
            ? $user->orders()
                ->whereIn('status', [OrderStatus::InProgress->value, OrderStatus::AwaitingGuardian->value])
                ->latest('placed_at')
                ->first()
            : null;

        $services = Service::where('is_active', true)->orderBy('sort')->take(6)->get();

        return view('pages.home', [
            'user' => $user,
            'currentOrder' => $currentOrder,
            'services' => $services,
            'walletMinor' => $user?->walletBalanceMinor() ?? 0,
            'points' => $user?->star_points ?? 0,
        ]);
    }
}
