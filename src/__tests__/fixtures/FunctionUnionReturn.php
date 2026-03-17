<?php
namespace App\Helpers;

/**
 * Demonstrates standalone functions with union return types.
 */
function formatValue(string $value, string $format = 'text'): string|int {
    return match($format) {
        'number' => (int) $value,
        default => "<span>{$value}</span>",
    };
}

function renderStatus(string $status, bool $asHtml = true): string|bool {
    if (!$asHtml) {
        return $status === 'active';
    }
    return "<span class=\"status-{$status}\">{$status}</span>";
}
