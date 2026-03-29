<?php
namespace App\Components;

class StatsCard {
    public function __construct(
        private string $label,
        private int $value,
    ) {}

    public function render(): array {
        return [
            'html' => "<div class=\"stats\">{$this->label}: {$this->value}</div>",
        ];
    }
}
