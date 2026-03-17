<?php
namespace App\Components;

class MatchPanel {
    public function __construct(
        private string $variant = 'default',
        private string $title = '',
        private string $content = '',
    ) {}

    public function render(): string {
        return match ($this->variant) {
            'card' => "<div class=\"card\"><h3>{$this->title}</h3><p>{$this->content}</p></div>",
            'banner' => "<div class=\"banner\"><h3>{$this->title}</h3><p>{$this->content}</p></div>",
            default => "<div class=\"default\"><h3>{$this->title}</h3><p>{$this->content}</p></div>",
        };
    }
}
