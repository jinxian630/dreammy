<?php

namespace App\Livewire\Shop;

use App\Models\Category;
use App\Models\Service;
use Livewire\Attributes\Title;
use Livewire\Attributes\Url;
use Livewire\Component;

#[Title('Services')]
class Catalogue extends Component
{
    #[Url(as: 'q', history: true)]
    public string $search = '';

    #[Url(history: true)]
    public string $category = 'all';

    #[Url(history: true)]
    public string $sort = 'popular';

    public function updated(): void
    {
        // keep url tidy; nothing else needed for a simple filter
    }

    public function selectCategory(string $slug): void
    {
        $this->category = $slug;
    }

    public function render()
    {
        $services = Service::query()
            ->where('is_active', true)
            ->when($this->search !== '', function ($q) {
                $q->where(function ($sub) {
                    $sub->where('name', 'like', '%'.$this->search.'%')
                        ->orWhere('tagline', 'like', '%'.$this->search.'%')
                        ->orWhere('description', 'like', '%'.$this->search.'%');
                });
            })
            ->when($this->category !== 'all', function ($q) {
                $q->whereHas('category', fn ($c) => $c->where('slug', $this->category));
            })
            ->when($this->sort === 'price_asc', fn ($q) => $q->orderBy('price_minor'))
            ->when($this->sort === 'price_desc', fn ($q) => $q->orderByDesc('price_minor'))
            ->when($this->sort === 'newest', fn ($q) => $q->orderByDesc('created_at'))
            ->when($this->sort === 'popular', fn ($q) => $q->orderByDesc('is_popular')->orderBy('sort'))
            ->get();

        return view('livewire.shop.catalogue', [
            'services' => $services,
            'categories' => Category::orderBy('sort')->get(),
        ]);
    }
}
