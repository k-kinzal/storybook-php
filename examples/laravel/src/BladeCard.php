<?php

namespace App\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class BladeCard extends Component
{
    public function __construct(
        public string $title,
        public string $body,
        public ?string $image = null,
        public ?string $footer = null,
        public bool $featured = false,
    ) {}

    public function render(): View
    {
        return $this->view('components.card');
    }
}
