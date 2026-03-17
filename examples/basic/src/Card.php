<?php
namespace App\Components;

class Card {
    public function __construct(
        private string $title,
        private string $body,
        private string $variant = 'default',
        private bool $featured = false,
    ) {}

    public function render(): string {
        $classes = "card card-{$this->variant}";
        if ($this->featured) {
            $classes .= ' card-featured';
        }
        return <<<HTML
        <div class="{$classes}">
            <h3 class="card-title">{$this->title}</h3>
            <p class="card-body">{$this->body}</p>
        </div>
        HTML;
    }
}
