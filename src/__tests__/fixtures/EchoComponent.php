<?php
namespace App\Components;

class Layout {
    public function __construct(private string $title) {}

    public function render(): void {
        ?><div class="layout"><h1><?= htmlspecialchars($this->title) ?></h1></div><?php
    }
}
