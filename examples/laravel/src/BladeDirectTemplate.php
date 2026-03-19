<?php

namespace App\View\Components;

use Illuminate\View\Component;

class BladeDirectTemplate extends Component
{
    public function __construct(
        public string $title = 'Welcome',
        public string $message = 'Hello from Blade!',
    ) {}

    public function render(): \Illuminate\Contracts\View\View
    {
        return $this->view('direct-template');
    }
}
