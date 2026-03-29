<?php
namespace App\Components;

class DualCallable {
    public function __construct(
        private string $label,
        private string $variant = 'default',
    ) {}

    public function __invoke(string $wrapper = 'span'): string {
        return "<{$wrapper}>{$this->label}</{$wrapper}>";
    }

    public function render(): string {
        return "<div class=\"dual-card\"><strong>{$this->label}</strong> ({$this->variant})</div>";
    }
}
