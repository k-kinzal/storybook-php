<?php
namespace App\Components;

class SplitView {
    public function __construct(
        private string $title,
        private string $description = '',
        private string $theme = 'light',
    ) {}

    public function renderFull(): string {
        return "<div class=\"split-full\"><h3>{$this->title}</h3><p>{$this->description}</p></div>";
    }

    public function renderCompact(): string {
        return "<div class=\"split-compact\"><strong>{$this->title}</strong> {$this->description}</div>";
    }
}
