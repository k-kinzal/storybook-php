<?php
namespace App\Components;

/**
 * Demonstrates a class with both __invoke and render methods.
 * Can be imported as @__invoke or @render independently.
 */
class DualCallable {
    public function __construct(
        private string $label,
        private string $variant = 'default',
    ) {}

    public function __invoke(string $wrapper = 'span'): string {
        $bg = match ($this->variant) {
            'primary' => '#3b82f6',
            'danger' => '#ef4444',
            default => '#6b7280',
        };
        return "<{$wrapper} style=\"color: white; background: {$bg}; padding: 2px 8px; border-radius: 4px; font-size: 13px;\">{$this->label}</{$wrapper}>";
    }

    public function render(): string {
        $borderColor = match ($this->variant) {
            'primary' => '#3b82f6',
            'danger' => '#ef4444',
            default => '#e5e7eb',
        };
        return "<div class=\"dual-card\" style=\"border: 2px solid {$borderColor}; border-radius: 8px; padding: 16px; font-family: system-ui;\"><strong>{$this->label}</strong><span style=\"margin-left: 8px; color: #9ca3af; font-size: 12px;\">{$this->variant}</span></div>";
    }
}
