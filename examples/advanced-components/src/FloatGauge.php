<?php
namespace App\Components;

/**
 * Demonstrates float type parameters and numeric rendering.
 * Uses float for precise measurements and percentages.
 */
class FloatGauge {
    public function __construct(
        private string $label,
        private float $value,
        private float $min = 0.0,
        private float $max = 100.0,
        private int $precision = 1,
        private string $unit = '%',
    ) {}

    public function render(): string {
        $pct = ($this->value - $this->min) / ($this->max - $this->min) * 100;
        $pct = max(0, min(100, $pct));
        $display = number_format($this->value, $this->precision);
        $color = $pct > 80 ? '#22c55e' : ($pct > 50 ? '#eab308' : '#ef4444');

        return "<div class=\"float-gauge\" style=\"font-family: system-ui; max-width: 240px;\">
            <div style=\"display: flex; justify-content: space-between; margin-bottom: 4px;\">
                <span style=\"font-weight: 600; font-size: 14px;\">{$this->label}</span>
                <span style=\"font-size: 14px; color: {$color}; font-weight: bold;\">{$display}{$this->unit}</span>
            </div>
            <div style=\"height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;\">
                <div style=\"width: {$pct}%; height: 100%; background: {$color}; border-radius: 4px; transition: width 0.3s;\"></div>
            </div>
        </div>";
    }
}
