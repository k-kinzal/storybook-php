<?php
/**
 * Demonstrates standalone functions returning ['html' => '...'] array format.
 * The runner's resolveOutput function detects arrays with an 'html' key
 * and extracts the value.
 */
function statusCard(string $title, string $status = 'active', int $count = 0): array {
    $colors = [
        'active'   => '#22c55e',
        'inactive' => '#6b7280',
        'pending'  => '#f59e0b',
    ];
    $color = $colors[$status] ?? '#6b7280';

    return [
        'html' => "<div class=\"status-card\" style=\"display: inline-flex; align-items: center; gap: 12px; padding: 14px 20px; border: 1px solid #e5e7eb; border-radius: 10px; font-family: system-ui;\">
            <div>
                <div style=\"font-size: 13px; color: #6b7280;\">{$title}</div>
                <div style=\"font-size: 24px; font-weight: 700; color: #111827;\">{$count}</div>
            </div>
            <span style=\"display: inline-block; padding: 4px 10px; border-radius: 12px; background: {$color}; color: white; font-size: 12px; font-weight: 600;\">{$status}</span>
        </div>",
    ];
}
