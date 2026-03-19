<?php

namespace App\View\Components;

use Illuminate\View\Component;

class BladePartial extends Component
{
    public function __construct(
        public string $name = 'Feature',
        public string $status = 'active',
    ) {}

    public function render(): \Illuminate\Contracts\View\View
    {
        return $this->view('components.partial-demo');
    }
}
