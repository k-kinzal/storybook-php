<?php
namespace App\Fixtures;

class StandaloneBoolType {
    public function __construct(
        private string $label = 'Toggle',
        private string $color = '#3b82f6',
    ) {}

    public function renderEnabled(true $state = true): string {
        return "<div style=\"color: {$this->color};\">ON: {$this->label}</div>";
    }

    public function renderDisabled(false $state = false): string {
        return "<div style=\"color: #9ca3af;\">OFF: {$this->label}</div>";
    }

    public static function renderNull(null $value = null): string {
        return "<div style=\"color: #d1d5db;\">No value</div>";
    }
}
