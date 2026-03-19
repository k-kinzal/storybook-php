<?php

namespace App\View\Components;

use Illuminate\View\Component;

class BladeNav extends Component
{
    /** @var list<array{label: string, href: string, active?: bool}> */
    public array $items;

    public function __construct(
        array $items = [],
        public string $brand = 'MyApp',
    ) {
        $this->items = $items ?: [
            ['label' => 'Home', 'href' => '/', 'active' => true],
            ['label' => 'About', 'href' => '/about'],
            ['label' => 'Contact', 'href' => '/contact'],
        ];
    }

    public function render(): \Illuminate\Contracts\View\View
    {
        return $this->view('components.nav');
    }
}
