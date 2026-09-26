<x-layouts.guest title="Log in">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Welcome back</h1>
        <p class="mt-1 text-sm text-ink-soft">Log in to continue your kinder Sky journey.</p>
    </div>

    <x-auth-session-status class="mb-4 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success" :status="session('status')" />

    <form method="POST" action="{{ route('login') }}" class="space-y-4">
        @csrf

        <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-plum">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus autocomplete="username" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('email')" class="mt-1 text-primary" />
        </div>

        <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-plum">Password</label>
            <input id="password" type="password" name="password" required autocomplete="current-password" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('password')" class="mt-1 text-primary" />
        </div>

        <div class="flex items-center justify-between">
            <label for="remember_me" class="inline-flex items-center gap-2 text-sm text-ink-soft">
                <input id="remember_me" type="checkbox" name="remember" class="rounded border-blush-deep text-primary focus:ring-primary/40">
                Remember me
            </label>
            @if (Route::has('password.request'))
                <a class="text-sm font-semibold text-primary hover:underline" href="{{ route('password.request') }}">Forgot password?</a>
            @endif
        </div>

        <button type="submit" class="btn-primary w-full">Log in</button>
    </form>

    <div class="my-5 flex items-center gap-3 text-xs text-ink-muted">
        <span class="h-px flex-1 bg-blush"></span> or <span class="h-px flex-1 bg-blush"></span>
    </div>

    <a href="{{ route('auth.discord') }}" class="btn-outline w-full">
        <x-icon name="sparkle" class="h-4 w-4" /> Continue with Discord
    </a>
    <p class="mt-2 text-center text-[11px] text-ink-muted">Discord sign-in is coming soon.</p>

    <p class="mt-6 text-center text-sm text-ink-soft">
        New here? <a href="{{ route('register') }}" class="font-semibold text-primary hover:underline">Create an account</a>
    </p>
</x-layouts.guest>
