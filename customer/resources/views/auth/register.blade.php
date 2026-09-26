<x-layouts.guest title="Create account">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Join Dreammy</h1>
        <p class="mt-1 text-sm text-ink-soft">Create your account and start a kinder journey.</p>
    </div>

    <form method="POST" action="{{ route('register') }}" class="space-y-4">
        @csrf

        <div>
            <label for="name" class="mb-1.5 block text-sm font-medium text-plum">Display name</label>
            <input id="name" type="text" name="name" value="{{ old('name') }}" required autofocus autocomplete="name" class="field rounded-2xl">
            <x-input-error :messages="$errors->get('name')" class="mt-1 text-primary" />
        </div>

        <div>
            <label for="email" class="mb-1.5 block text-sm font-medium text-plum">Email</label>
            <input id="email" type="email" name="email" value="{{ old('email') }}" required autocomplete="username" class="field rounded-2xl">
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

        <button type="submit" class="btn-primary w-full">Create account</button>
    </form>

    <p class="mt-6 text-center text-sm text-ink-soft">
        Already have an account? <a href="{{ route('login') }}" class="font-semibold text-primary hover:underline">Log in</a>
    </p>
</x-layouts.guest>
