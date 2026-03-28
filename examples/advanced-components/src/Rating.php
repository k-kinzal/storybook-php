<?php
namespace App\Components;

class Rating {
    public function __construct(
        private int $value,
        private int $max = 5,
        private string $filledChar = '&#9733;',
        private string $emptyChar = '&#9734;',
    ) {}

    public function render(): string {
        $clamped = max(0, min($this->value, $this->max));
        $stars = str_repeat("<span class=\"star filled\" style=\"color: #f59e0b; font-size: 20px;\">{$this->filledChar}</span>", $clamped);
        $empty = str_repeat("<span class=\"star empty\" style=\"color: #d1d5db; font-size: 20px;\">{$this->emptyChar}</span>", $this->max - $clamped);
        return "<div class=\"rating\">{$stars}{$empty} <span class=\"rating-text\">({$clamped}/{$this->max})</span></div>";
    }

    public static function fromPercent(int $percent, int $max = 5): string {
        $value = (int) round($percent / 100 * $max);
        return (new self($value, $max))->render();
    }
}
