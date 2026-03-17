<?php
namespace App\Components;

/**
 * Demonstrates a method that returns an associative array with
 * an 'html' key. The runner extracts $result['html'] automatically.
 */
class StatsCard {
    public function __construct(
        private string $label,
        private int|float $value,
        private ?string $unit = null,
        private ?float $change = null,
    ) {}

    public function render(): array {
        $formattedValue = is_float($this->value) ? number_format($this->value, 1) : number_format($this->value);
        $unitHtml = $this->unit !== null ? "<span class=\"stats-unit\" style=\"font-size: 14px; color: #6b7280;\">{$this->unit}</span>" : '';
        $changeHtml = '';
        if ($this->change !== null) {
            $arrow = $this->change >= 0 ? '&#9650;' : '&#9660;';
            $color = $this->change >= 0 ? '#22c55e' : '#ef4444';
            $pct = number_format(abs($this->change), 1);
            $changeHtml = "<div class=\"stats-change\" style=\"font-size: 13px; color: {$color};\">{$arrow} {$pct}%</div>";
        }

        return [
            'html' => "<div class=\"stats-card\" style=\"padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; min-width: 160px;\"><div class=\"stats-label\" style=\"color: #6b7280; font-size: 13px; margin-bottom: 4px;\">{$this->label}</div><div class=\"stats-value\" style=\"font-size: 28px; font-weight: bold;\">{$formattedValue} {$unitHtml}</div>{$changeHtml}</div>",
        ];
    }
}
