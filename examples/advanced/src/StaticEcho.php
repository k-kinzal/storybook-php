<?php
namespace App\Components;

/**
 * Demonstrates static methods with void/echo return.
 * Static methods that echo HTML instead of returning strings.
 * The runner captures the output via output buffering.
 */
class StaticEcho {
    public static function banner(string $title, string $color = '#3b82f6'): void {
        echo "<div class=\"static-banner\" style=\"padding: 16px 24px; background: {$color}; color: white; border-radius: 8px; font-family: system-ui;\">";
        echo "<h2 style=\"margin: 0; font-size: 20px;\">{$title}</h2>";
        echo "</div>";
    }

    public static function notice(string $message, string $type = 'info'): void {
        $colors = [
            'info'    => ['#eff6ff', '#3b82f6'],
            'success' => ['#f0fdf4', '#22c55e'],
            'warning' => ['#fffbeb', '#f59e0b'],
        ];
        [$bg, $accent] = $colors[$type] ?? $colors['info'];
        echo "<div class=\"static-notice static-notice-{$type}\" style=\"padding: 12px 16px; background: {$bg}; border-left: 4px solid {$accent}; border-radius: 0 6px 6px 0; font-family: system-ui;\">";
        echo "<span style=\"color: {$accent}; font-weight: 600;\">" . ucfirst($type) . ":</span> ";
        echo "<span style=\"color: #374151;\">{$message}</span>";
        echo "</div>";
    }
}
