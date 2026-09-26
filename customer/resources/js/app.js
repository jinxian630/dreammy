import './bootstrap';

import { Livewire, Alpine } from '../../vendor/livewire/livewire/dist/livewire.esm';
import collapse from '@alpinejs/collapse';

// Single Alpine instance (Livewire's) with the collapse plugin registered.
Alpine.plugin(collapse);

window.Alpine = Alpine;

Livewire.start();
