<?php
namespace App\Components;

class ComplexComponent {
    public function __construct(
        private string $title,
        private ?string $subtitle = null,
        private bool $featured = false,
        private array $items = [],
    ) {}

    public function render(): string {
        return "<div class=\"complex\">{$this->title}</div>";
    }

    public function renderCard(string $extra = ''): string {
        return "<div class=\"card\">{$this->title}{$extra}</div>";
    }
}
