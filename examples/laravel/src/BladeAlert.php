<?php

namespace App\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class BladeAlert extends Component
{
    public function __construct(
        public string $title,
        public string $type = 'info',
        public ?string $message = null,
        public bool $dismissible = false,
    ) {}

    public function render(): View
    {
        return $this->view('components.alert');
    }
}
