<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 final readonly class with constructor promotion
 * and a static factory method.
 */
final readonly class Coordinate {
    public function __construct(
        public float $latitude,
        public float $longitude,
        public string $label = '',
    ) {}

    public static function origin(string $label = 'Origin'): string {
        return (new self(0.0, 0.0, $label))->render();
    }

    public function render(): string {
        $lat = number_format($this->latitude, 4);
        $lng = number_format($this->longitude, 4);
        $labelHtml = $this->label !== ''
            ? "<div style=\"font-weight: bold; margin-bottom: 4px;\">{$this->label}</div>"
            : '';
        $ns = $this->latitude >= 0 ? 'N' : 'S';
        $ew = $this->longitude >= 0 ? 'E' : 'W';
        return <<<HTML
        <div class="coordinate" style="display: inline-block; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-family: monospace; background: #f9fafb;">
            {$labelHtml}
            <span style="color: #3b82f6;">{$lat}&deg;{$ns}</span>,
            <span style="color: #10b981;">{$lng}&deg;{$ew}</span>
        </div>
        HTML;
    }
}
