<?php
namespace App\Components;

/**
 * Demonstrates methods with `void` and `never` return types.
 * The `void` method uses echo for output (captured by output buffering).
 * The `never` method always throws (used for error boundaries).
 * Tests parser extraction of special return type keywords.
 */
class VoidEchoCard {
    public function __construct(
        private string $title = 'Card',
        private string $body = '',
        private string $variant = 'default',
    ) {}

    public function renderEcho(): void {
        $colors = [
            'default' => ['#f9fafb', '#374151', '#e5e7eb'],
            'primary' => ['#eff6ff', '#1e40af', '#bfdbfe'],
            'success' => ['#f0fdf4', '#166534', '#bbf7d0'],
        ];
        [$bg, $fg, $border] = $colors[$this->variant] ?? $colors['default'];
        echo "<div class=\"echo-card\" style=\"padding: 16px; background: {$bg}; color: {$fg}; border: 1px solid {$border}; border-radius: 8px; font-family: system-ui;\">";
        echo "<h4 style=\"margin: 0 0 8px;\">{$this->title}</h4>";
        if ($this->body !== '') {
            echo "<p style=\"margin: 0;\">{$this->body}</p>";
        }
        echo "</div>";
    }

    public function render(): string {
        $colors = [
            'default' => ['#f9fafb', '#374151', '#e5e7eb'],
            'primary' => ['#eff6ff', '#1e40af', '#bfdbfe'],
            'success' => ['#f0fdf4', '#166534', '#bbf7d0'],
        ];
        [$bg, $fg, $border] = $colors[$this->variant] ?? $colors['default'];
        return "<div class=\"echo-card\" style=\"padding: 16px; background: {$bg}; color: {$fg}; border: 1px solid {$border}; border-radius: 8px; font-family: system-ui;\"><h4 style=\"margin: 0 0 8px;\">{$this->title}</h4><p style=\"margin: 0;\">{$this->body}</p></div>";
    }

    public function fail(): never {
        throw new \RuntimeException("Card '{$this->title}' encountered a fatal error");
    }
}
