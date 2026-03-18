<?php
namespace App\Helpers;

/**
 * Demonstrates standalone functions with union return types.
 */
function formatValue(string $value, string $format = 'text'): string|int {
    return match($format) {
        'number' => (int) $value,
        default => "<span class=\"formatted-value\" style=\"padding: 2px 6px; background: #f3f4f6; border-radius: 3px; font-family: monospace;\">{$value}</span>",
    };
}

function renderStatus(string $status, bool $showIcon = true): string|bool {
    $icons = ['active' => '●', 'inactive' => '○', 'pending' => '◌'];
    $colors = ['active' => '#22c55e', 'inactive' => '#9ca3af', 'pending' => '#f59e0b'];
    $icon = $showIcon ? ($icons[$status] ?? '?') . ' ' : '';
    $color = $colors[$status] ?? '#6b7280';
    return "<span class=\"status-indicator\" style=\"color: {$color}; font-family: system-ui; font-size: 14px;\">{$icon}{$status}</span>";
}
