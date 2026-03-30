<?php
namespace App\Components;

readonly class Settings {
    public function __construct(
        public string $theme = 'light',
        public int $fontSize = 14,
        public bool $animations = true,
    ) {}

    public function render(): string
    {
        return "<div class=\"settings\">{$this->theme} {$this->fontSize}px</div>";
    }
}
