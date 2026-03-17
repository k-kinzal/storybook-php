<?php
namespace App\Components;

class Nav {
    public function __construct(
        private string $brand,
        private ?string $subtitle = null,
        private bool $sticky = false,
    ) {}

    public function render(?string $activeItem = null): string {
        $classes = 'nav';
        if ($this->sticky) {
            $classes .= ' nav-sticky';
        }
        $sub = $this->subtitle !== null
            ? "<small class=\"nav-subtitle\">{$this->subtitle}</small>"
            : '';
        $active = $activeItem !== null
            ? "<span class=\"nav-active\">{$activeItem}</span>"
            : '';
        return <<<HTML
        <nav class="{$classes}">
            <div class="nav-brand">{$this->brand}{$sub}</div>
            {$active}
        </nav>
        HTML;
    }
}
