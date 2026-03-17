<?php

namespace App\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class BladeStats extends Component
{
    /**
     * @param array<int, array{label: string, value: string|int}> $items
     */
    public function __construct(
        public array $items,
        public string $color = '#3b82f6',
    ) {}

    public function render(): View
    {
        return $this->view('components.stats');
    }
}
