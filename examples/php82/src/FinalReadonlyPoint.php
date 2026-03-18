<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 final readonly class with float params.
 * Combines final + readonly modifiers and public promoted properties.
 */
final readonly class Point {
    public function __construct(
        public float $x,
        public float $y,
        public string $label = '',
    ) {}

    public function render(): string {
        $labelHtml = $this->label !== '' ? "<span style=\"color: #6b7280; font-size: 11px; margin-left: 6px;\">{$this->label}</span>" : '';
        return <<<HTML
        <div style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; font-family: monospace; font-size: 13px;">
            <span style="color: #16a34a; font-weight: 600;">({$this->x}, {$this->y})</span>{$labelHtml}
        </div>
        HTML;
    }

    public static function origin(): string {
        return (new self(0.0, 0.0, 'origin'))->render();
    }
}
