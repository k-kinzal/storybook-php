<?php
namespace App\Components;

class PageHeader {
    public function __construct(
        private string $title,
        private string $subtitle = '',
    ) {}

    public function render(): string {
        return "<header><h1>{$this->title}</h1></header>";
    }
}

class PageFooter {
    public function __construct(
        private string $copyright,
        private int $year = 2024,
    ) {}

    public function render(): string {
        return "<footer>&copy; {$this->year} {$this->copyright}</footer>";
    }
}

class PageSidebar {
    public function __construct(
        private string $label,
    ) {}

    public function render(): string {
        return "<aside>{$this->label}</aside>";
    }

    public static function collapsed(string $icon = '☰'): string {
        return "<aside class=\"collapsed\">{$icon}</aside>";
    }
}
