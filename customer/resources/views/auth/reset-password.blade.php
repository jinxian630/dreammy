<x-layouts.guest title="Reset password">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Choose a new password</h1>
        <p class="mt-1 text-sm text-ink-soft">Enter and confirm your new password below.</p>
    </div>

    <form method="POST" action="{{ route('password.store') }}" class="space-y-4">
        @csrf
        <input type="hidden" name="token" value="{{ $request->route('token') }}">

        <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-plum">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email', $request->email) }}" required autofocus autocomplete="username" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('email')" class="mt-1 text-primary" />
        </div>
        <div>
            <label for="password" class="mb-1.5 block text-sm font-medium text-plum">Password</label>
            <input id="password" type="password" name="password" required autocomplete="new-password" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('password')" class="mt-1 text-primary" />
        </div>
        <div>
            <label for="password_confirmation" class="mb-1.5 block text-sm font-medium text-plum">Confirm password</label>
            <input id="password_confirmation" type="password" name="password_confirmation" required autocomplete="new-password" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('password_confirmation')" class="mt-1 text-primary" />
        </div>
        <button type="submit" class="btn-primary w-full">Reset password</button>
    </form>
</x-layouts.guest>
