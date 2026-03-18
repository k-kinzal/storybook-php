<?php
namespace App\Components;

class Temperature {
    public function __construct(
        private float $value,
        private string $unit = 'C',
    ) {}

    public static function fromFahrenheit(float $degrees): string {
        $celsius = ($degrees - 32) * 5 / 9;
        return (new self($celsius, 'C'))->render();
    }

    public static function fromCelsius(float $degrees): string {
        return (new self($degrees, 'C'))->render();
    }

    public function render(): string {
        $formatted = number_format($this->value, 1);
        $color = match (true) {
            $this->value < 0 => '#3b82f6',
            $this->value < 20 => '#06b6d4',
            $this->value < 30 => '#f59e0b',
            default => '#ef4444',
        };
        return "<span class=\"temperature\" style=\"color: {$color}; font-weight: bold;\">{$formatted}&deg;{$this->unit}</span>";
    }
}
