<x-layouts.guest title="Confirm password">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Confirm your password</h1>
        <p class="mt-1 text-sm text-ink-soft">This is a secure area. Please confirm your password to continue.</p>
    </div>

    <form method="POST" action="{{ route('password.confirm') }}" class="space-y-4">
        @csrf
        <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-plum">Password</label>
            <input id="password" type="password" name="password" required autocomplete="current-password" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('password')" class="mt-1 text-primary" />
        </div>
        <button type="submit" class="btn-primary w-full">Confirm</button>
    </form>
</x-layouts.guest>
