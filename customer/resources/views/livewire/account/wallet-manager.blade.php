<div>
    <x-hero eyebrow="Dream Wallet" title="Dream Wallet" image="hero.wallet" script="Kindness travels far ♡">
        A brighter tomorrow starts with small acts of kindness.
    </x-hero>

    <div class="shell space-y-6 py-8">
        {{-- Balance + pending + notice --}}
        <div class="grid gap-6 lg:grid-cols-2">
            <x-card padding="p-5 sm:p-6" class="relative isolate overflow-hidden">
                <div class="flex items-start justify-between gap-4">
                    <div>
                        <div class="flex items-center gap-2 text-plum"><x-icon name="bag" class="h-5 w-5 text-gold-deep" /><span class="font-semibold">Wallet Balance</span></div>
                        <p class="mt-2 font-display text-4xl font-semibold text-plum"><x-money :minor="$balanceMinor" /></p>
                        <p class="mt-1 text-sm text-ink-soft">A little light, a lot of kindness.</p>
                    </div>
                    <span class="hidden h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:block">
                        <x-image-slot key="wallet.balance" ratio="1/1" rounded="rounded-2xl" alt="" />
                    </span>
                </div>
                <div class="mt-5 grid grid-cols-2 gap-3">
                    <a href="#top-up" class="btn-primary"><x-icon name="plus-circle" class="h-4 w-4" /> Top up</a>
                    <button type="button" wire:click="withdraw" class="btn-outline"><x-icon name="bank" class="h-4 w-4" /> Withdraw</button>
                </div>
            </x-card>

            <div class="space-y-6">
                <x-card padding="p-5 sm:p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-2 text-plum"><x-icon name="hourglass" class="h-5 w-5 text-primary" /><span class="font-semibold">Pending Withdrawal</span></div>
                            <p class="mt-2 font-display text-3xl font-semibold text-plum"><x-money :minor="$pendingMinor" /></p>
                            <p class="mt-1 text-sm text-ink-soft">Withdrawals are reviewed before being processed.</p>
                        </div>
                        <span class="hidden h-20 w-24 shrink-0 overflow-hidden rounded-2xl sm:block">
                            <x-image-slot key="wallet.pending" ratio="9/7" rounded="rounded-2xl" alt="" />
                        </span>
                    </div>
                </x-card>

                <x-card padding="p-5 sm:p-6">
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <div class="mb-2 flex items-center gap-2 text-plum"><x-icon name="megaphone" class="h-5 w-5 text-primary" /><span class="font-semibold">Important Notice</span></div>
                            <ul class="space-y-1.5 text-sm text-ink-soft">
                                <li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span> Withdrawals are reviewed to keep your account safe.</li>
                                <li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span> There is no transfer to other user function at this time.</li>
                                <li class="flex gap-2"><span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span> Thank you for being part of a kinder Sky together!</li>
                            </ul>
                        </div>
                        <span class="hidden h-20 w-24 shrink-0 overflow-hidden rounded-2xl sm:block">
                            <x-image-slot key="wallet.notice" ratio="9/7" rounded="rounded-2xl" alt="" />
                        </span>
                    </div>
                </x-card>
            </div>
        </div>

        {{-- Top up + transactions --}}
        <div class="grid gap-6 lg:grid-cols-2">
            {{-- Top up --}}
            <x-card padding="p-5 sm:p-6" id="top-up">
                <x-section-heading icon="card" title="Top Up Wallet" subtitle="Choose an amount or enter your own." />

                <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    @foreach ($presets as $p)
                        <button type="button" wire:click="selectPreset({{ $p }})"
                                @class([
                                    'rounded-2xl border px-3 py-3 text-sm font-semibold transition',
                                    'border-primary bg-primary-soft/50 text-primary' => $preset === $p,
                                    'border-blush-deep/60 bg-white text-ink-soft hover:border-primary/40' => $preset !== $p,
                                ])>RM {{ $p }}</button>
                    @endforeach
                </div>

                <div class="mt-4">
                    <label class="mb-1.5 block text-sm text-ink-soft">Or enter a custom amount</label>
                    <div class="flex items-center gap-2 rounded-2xl border border-blush-deep/70 bg-white px-3 focus-within:border-primary">
                        <span class="text-sm font-semibold text-ink-muted">RM</span>
                        <input type="number" min="1" step="1" wire:model.live="custom" placeholder="Enter amount (e.g. 20)" class="w-full border-0 bg-transparent py-3 focus:ring-0">
                    </div>
                    @error('custom') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror
                </div>

                <div class="mt-4">
                    <label class="mb-1.5 block text-sm text-ink-soft">Payment method</label>
                    <div class="grid grid-cols-2 gap-3">
                        <label class="flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm {{ $method === 'online_banking' ? 'border-primary bg-primary-soft/40' : 'border-blush-deep/60' }}">
                            <input type="radio" wire:model.live="method" value="online_banking" class="text-primary focus:ring-primary/40">
                            <x-icon name="bank" class="h-4 w-4 text-primary" /> Online banking
                        </label>
                        <label class="flex cursor-pointer items-center gap-2 rounded-2xl border px-3 py-3 text-sm {{ $method === 'ewallet' ? 'border-primary bg-primary-soft/40' : 'border-blush-deep/60' }}">
                            <input type="radio" wire:model.live="method" value="ewallet" class="text-primary focus:ring-primary/40">
                            <x-icon name="card" class="h-4 w-4 text-primary" /> E-wallet
                        </label>
                    </div>
                    <p class="mt-2 inline-block rounded-full bg-warn-soft px-2 py-0.5 text-[10px] font-semibold text-warn">Dev mock — credited instantly, no real gateway</p>
                </div>

                <button type="button" wire:click="topUp" wire:loading.attr="disabled" class="btn-primary mt-5 w-full">
                    <span wire:loading.remove wire:target="topUp">Continue <x-icon name="arrow-right" class="h-4 w-4" /></span>
                    <span wire:loading wire:target="topUp">Processing…</span>
                </button>
            </x-card>

            {{-- Transactions --}}
            <x-card padding="p-5 sm:p-6">
                <div class="mb-4 flex items-center justify-between">
                    <div class="flex items-center gap-2"><x-icon name="document" class="h-5 w-5 text-primary" /><h2 class="font-display text-lg font-semibold text-plum">Recent Transactions</h2></div>
                    <button type="button" wire:click="$toggle('showAllTransactions')" class="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        {{ $showAllTransactions ? 'Show less' : 'View all' }} <x-icon name="chevron-down" class="h-4 w-4 {{ $showAllTransactions ? 'rotate-180' : '' }}" />
                    </button>
                </div>

                @forelse ($transactions as $tx)
                    <div class="flex items-center gap-3 border-b border-blush/60 py-3 last:border-0" wire:key="tx-{{ $tx->id }}">
                        <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {{ $tx->isCredit() ? 'bg-success-soft text-success' : 'bg-blush text-primary' }}">
                            <x-icon :name="$tx->type->icon()" class="h-4 w-4" />
                        </span>
                        <div class="min-w-0 flex-1">
                            <p class="truncate text-sm font-medium text-plum">{{ $tx->description }}</p>
                            <p class="text-xs text-ink-muted">{{ $tx->created_at->format('M j, Y · g:i A') }}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-sm font-semibold {{ $tx->isCredit() ? 'text-success' : 'text-primary' }}"><x-money :minor="$tx->amount_minor" :signed="true" /></p>
                            <span class="inline-flex items-center gap-1 text-[11px] text-success"><x-icon name="check-circle" class="h-3 w-3" /> {{ ucfirst($tx->status) }}</span>
                        </div>
                    </div>
                @empty
                    <p class="py-6 text-center text-sm text-ink-soft">No transactions yet.</p>
                @endforelse
            </x-card>
        </div>
    </div>
</div>
