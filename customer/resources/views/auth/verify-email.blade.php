<x-layouts.guest title="Verify email">
    <div class="mb-6 text-center">
        <h1 class="font-display text-2xl font-semibold text-plum">Verify your email</h1>
        <p class="mt-1 text-sm text-ink-soft">Thanks for signing up! Please verify your email using the link we just sent. Didn't get it? We'll gladly send another.</p>
    </div>

    @if (session('status') == 'verification-link-sent')
        <div class="mb-4 rounded-2xl bg-success-soft px-4 py-3 text-sm text-success">A new verification link has been sent to your email address.</div>
    @endif

    <div class="space-y-3">
        <form method="POST" action="{{ route('verification.send') }}">
            @csrf
            <button type="submit" class="btn-primary w-full">Resend verification email</button>
        </form>
        <form method="POST" action="{{ route('logout') }}">
            @csrf
            <button type="submit" class="btn-outline w-full">Log out</button>
        </form>
    </div>
</x-layouts.guest>
