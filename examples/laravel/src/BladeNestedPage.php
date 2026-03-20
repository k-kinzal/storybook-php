<?php

namespace App\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class BladeNestedPage extends Component
{
    /**
     * @param array<int, array{name: string, status: string}> $items
     */
    public function __construct(
        public string $title = 'Nested Page',
        public string $subtitle = 'Testing multi-level Blade rendering',
        public array $items = [
            ['name' => 'Item A', 'status' => 'active'],
            ['name' => 'Item B', 'status' => 'inactive'],
        ],
        public bool $showAlert = true,
    ) {}

    public function render(): View
    {
        return $this->view('components.nested-page');
    }
}
