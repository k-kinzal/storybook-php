<?php
namespace App\Components;

/**
 * Demonstrates int|float union type constructor parameter,
 * nullable method param, and clamped value rendering.
 */
class Meter {
    public function __construct(
        private int|float $value,
        private int|float $min = 0,
        private int|float $max = 100,
        private string $label = '',
    ) {}

    public function render(?string $color = null): string
    {
        $range = $this->max - $this->min;
        $clamped = max($this->min, min($this->max, $this->value));
        $percent = $range > 0 ? (($clamped - $this->min) / $range) * 100 : 0;
        $formatted = number_format((float) $percent, 1);

        $bg = $color ?? match (true) {
            $percent >= 80 => '#22c55e',
            $percent >= 50 => '#f59e0b',
            $percent >= 25 => '#f97316',
            default => '#ef4444',
        };

        $labelHtml = $this->label !== '' ? "<span class=\"meter-label\">{$this->label}</span>" : '';

        return "<div class=\"meter\">{$labelHtml}<div class=\"meter-track\" style=\"background: #e5e7eb; border-radius: 4px; height: 20px; overflow: hidden;\"><div class=\"meter-fill\" style=\"background: {$bg}; width: {$formatted}%; height: 100%; transition: width 0.3s;\"></div></div><span class=\"meter-value\">{$formatted}%</span></div>";
    }
}
