<x-layouts.guest title="Forgot password">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Forgot your password?</h1>
        <p class="mt-1 text-sm text-ink-soft">No problem. Tell us your email and we'll send a reset link.</p>
    </div>

    <x-auth-session-status class="mb-4 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success" :status="session('status')" />

    <form method="POST" action="{{ route('password.email') }}" class="space-y-4">
        @csrf
        <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-plum">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autofocus class="field rounded-2xl">
            <x-input-error :messages="$errors->get('email')" class="mt-1 text-primary" />
        </div>
        <button type="submit" class="btn-primary w-full">Email password reset link</button>
    </form>

    <p class="mt-6 text-center text-sm text-ink-soft"><a href="{{ route('login') }}" class="font-semibold text-primary hover:underline">Back to log in</a></p>
</x-layouts.guest>
