<?php
namespace App\Components;

/**
 * Demonstrates a class with both echo (void) and return methods.
 * Both styles can be used as separate story imports.
 */
class MixedOutput {
    public function __construct(
        private string $title,
        private string $content = '',
        private string $variant = 'info',
    ) {}

    public function render(): string {
        $colors = $this->variantColors();
        $contentHtml = $this->content !== ''
            ? "<p style=\"margin: 8px 0 0; font-size: 14px;\">{$this->content}</p>"
            : '';
        return "<div class=\"mixed-return\" style=\"background: {$colors['bg']}; color: {$colors['fg']}; border-left: 4px solid {$colors['border']}; padding: 12px 16px; border-radius: 4px; font-family: system-ui;\"><strong>{$this->title}</strong>{$contentHtml}</div>";
    }

    public function renderEcho(): void {
        $colors = $this->variantColors();
        echo "<div class=\"mixed-echo\" style=\"background: {$colors['bg']}; border: 1px solid {$colors['border']}; border-radius: 8px; padding: 16px; font-family: system-ui;\">";
        echo "<h4 style=\"margin: 0; color: {$colors['fg']};\">{$this->title}</h4>";
        if ($this->content !== '') {
            echo "<p style=\"margin: 8px 0 0; color: {$colors['fg']}; opacity: 0.8; font-size: 14px;\">{$this->content}</p>";
        }
        echo '</div>';
    }

    private function variantColors(): array {
        return match ($this->variant) {
            'success' => ['bg' => '#f0fdf4', 'fg' => '#166534', 'border' => '#22c55e'],
            'warning' => ['bg' => '#fffbeb', 'fg' => '#92400e', 'border' => '#f59e0b'],
            'danger' => ['bg' => '#fef2f2', 'fg' => '#991b1b', 'border' => '#ef4444'],
            default => ['bg' => '#eff6ff', 'fg' => '#1e40af', 'border' => '#3b82f6'],
        };
    }
}
