<?php
namespace App\Components;

class Layout {
    public function __construct(
        private string $title,
        private string $theme = 'light',
    ) {}

    public function render(): void {
        ?><div class="layout layout-<?= htmlspecialchars($this->theme) ?>">
            <header><h1><?= htmlspecialchars($this->title) ?></h1></header>
            <main><slot></slot></main>
        </div><?php
    }
}
