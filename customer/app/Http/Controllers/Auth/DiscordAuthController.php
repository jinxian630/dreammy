<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

/**
 * Discord OAuth — STUB.
 *
 * Wiring is in place (config/services.php + Laravel Socialite is installed) but
 * the live flow is intentionally not enabled in this build. When you add
 * DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET to .env, replace the guard below with
 * the real Socialite calls (commented for reference).
 */
class DiscordAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        if (! $this->configured()) {
            return redirect()->route('login')
                ->with('status', 'Discord login isn’t configured yet. Please use your email and password.');
        }

        // return \Laravel\Socialite\Facades\Socialite::driver('discord')->redirect();
        return redirect()->route('login')->with('status', 'Discord login is coming soon.');
    }

    public function callback(): RedirectResponse
    {
        if (! $this->configured()) {
            return redirect()->route('login')->with('status', 'Discord login isn’t configured yet.');
        }

        // $discordUser = \Laravel\Socialite\Facades\Socialite::driver('discord')->user();
        // Find-or-create a local user keyed by discord_id, then Auth::login(...).
        return redirect()->route('login')->with('status', 'Discord login is coming soon.');
    }

    private function configured(): bool
    {
        return filled(config('services.discord.client_id')) && filled(config('services.discord.client_secret'));
    }
}
