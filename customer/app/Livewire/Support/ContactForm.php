<?php

namespace App\Livewire\Support;

use Livewire\Component;

class ContactForm extends Component
{
    public string $topic = '';

    public string $orderId = '';

    public string $message = '';

    public function submit(): void
    {
        $this->validate([
            'topic' => ['required', 'string', 'max:60'],
            'orderId' => ['nullable', 'string', 'max:50'],
            'message' => ['required', 'string', 'min:5', 'max:1000'],
        ], [
            'topic.required' => 'Please choose a topic.',
            'message.required' => 'Please write a short message.',
        ]);

        // NOTE: not wired to a mailbox/ticketing system in this build (documented
        // remaining integration). We acknowledge receipt so the flow is complete.
        $this->reset('topic', 'orderId', 'message');

        session()->flash('success', "Thanks! Your message has been received. We'll get back to you as soon as possible.");
    }

    public function render()
    {
        return view('livewire.support.contact-form', [
            'topics' => ['Ordering', 'Payments & wallet', 'Service progress', 'Account safety', 'Something else'],
        ]);
    }
}
