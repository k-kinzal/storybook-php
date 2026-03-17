<?php
namespace App\Components;

/**
 * Demonstrates an invocable class (__invoke) that uses echo (void return)
 * instead of returning a string. Tests the combination of two patterns.
 */
class InvocableEcho {
    public function __construct(
        private string $prefix = 'Note',
        private string $variant = 'info',
    ) {}

    public function __invoke(string $message, bool $showIcon = true): void {
        $icons = [
            'info'    => 'ℹ️',
            'success' => '✅',
            'warning' => '⚠️',
            'error'   => '❌',
        ];
        $colors = [
            'info'    => '#3b82f6',
            'success' => '#22c55e',
            'warning' => '#f59e0b',
            'error'   => '#ef4444',
        ];
        $icon = $showIcon ? ($icons[$this->variant] ?? '') . ' ' : '';
        $color = $colors[$this->variant] ?? '#6b7280';

        echo '<div class="invocable-echo invocable-echo-' . $this->variant . '" style="';
        echo "display:inline-flex;align-items:center;gap:6px;padding:8px 14px;";
        echo "border:1px solid {$color};border-radius:6px;font-family:system-ui;font-size:14px;\">";
        echo "<span>{$icon}<strong style=\"color:{$color};\">{$this->prefix}:</strong> {$message}</span>";
        echo '</div>';
    }
}
