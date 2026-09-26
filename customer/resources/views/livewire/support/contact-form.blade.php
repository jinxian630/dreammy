<form wire:submit="submit" class="space-y-4">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
            <label class="mb-1.5 block text-sm font-medium text-plum">Topic</label>
            <select wire:model="topic" class="field rounded-2xl">
                <option value="">Select a topic</option>
                @foreach ($topics as $t)
                    <option value="{{ $t }}">{{ $t }}</option>
                @endforeach
            </select>
            @error('topic') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-plum">Order ID (optional)</label>
            <input type="text" wire:model="orderId" placeholder="e.g. #DM123456" class="field rounded-2xl">
            @error('orderId') <p class="mt-1 text-sm text-primary">{{ $message }}</p> @enderror
        </div>
    </div>

    <div x-data="{ len: $wire.message.length }">
        <label class="mb-1.5 block text-sm font-medium text-plum">Your message</label>
        <textarea wire:model="message" x-on:input="len = $event.target.value.length" maxlength="1000" rows="4"
                  placeholder="Type your message here…" class="field rounded-2xl"></textarea>
        <div class="mt-1 flex items-center justify-between">
            <span>@error('message') <span class="text-sm text-primary">{{ $message }}</span> @enderror</span>
            <span class="text-xs text-ink-muted"><span x-text="len">0</span> / 1000</span>
        </div>
    </div>

    <button type="submit" wire:loading.attr="disabled" class="btn-primary w-full sm:w-auto">
        <x-icon name="arrow-right" class="h-4 w-4" />
        <span wire:loading.remove wire:target="submit">Send request</span>
        <span wire:loading wire:target="submit">Sending…</span>
    </button>
</form>
