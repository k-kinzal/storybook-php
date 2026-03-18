<?php

namespace App\View\Components;

use Illuminate\View\Component;

class BladeProfile extends Component
{
    public function __construct(
        public string $name = 'John Doe',
        public string $role = 'Developer',
        public string $avatar = 'https://via.placeholder.com/64',
    ) {}

    public function initials(): string
    {
        return collect(explode(' ', $this->name))
            ->map(fn (string $part) => mb_strtoupper(mb_substr($part, 0, 1)))
            ->implode('');
    }

    public function render(): \Illuminate\Contracts\View\View
    {
        return view('components.profile');
    }
}
