<?php

use App\Http\Controllers\Auth\DiscordAuthController;
use App\Http\Controllers\HelpController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ServiceController;
use App\Livewire\Account\OrdersIndex;
use App\Livewire\Account\ProfileSettings;
use App\Livewire\Account\RewardsCenter;
use App\Livewire\Account\WalletManager;
use App\Livewire\Shop\Catalogue;
use App\Livewire\Shop\Checkout;
use Illuminate\Support\Facades\Route;

// ---- Public ----
Route::get('/', HomeController::class)->name('home');
Route::get('/services', Catalogue::class)->name('services.index');
Route::get('/services/{service}', [ServiceController::class, 'show'])->name('services.show');
Route::get('/help', HelpController::class)->name('help.index');

// Discord OAuth (stub — see DiscordAuthController)
Route::get('/auth/discord', [DiscordAuthController::class, 'redirect'])->name('auth.discord');
Route::get('/auth/discord/callback', [DiscordAuthController::class, 'callback'])->name('auth.discord.callback');

// ---- Authenticated ----
Route::middleware('auth')->group(function () {
    // Checkout + order flow
    Route::get('/checkout/{order}', Checkout::class)->name('checkout.show');
    Route::get('/orders', OrdersIndex::class)->name('orders.index');
    Route::get('/orders/{order}/confirmed', [OrderController::class, 'confirmed'])->name('orders.confirmed');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    // Wallet, rewards, profile
    Route::get('/wallet', WalletManager::class)->name('wallet.index');
    Route::get('/rewards', RewardsCenter::class)->name('rewards.index');
    Route::get('/profile', ProfileSettings::class)->name('profile.show');
});

require __DIR__.'/auth.php';
