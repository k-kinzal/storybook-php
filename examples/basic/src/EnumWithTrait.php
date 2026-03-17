<?php
namespace App\Components;

/**
 * Demonstrates enum using traits (PHP 8.1+).
 * Enums can use traits to share rendering logic across enum types.
 */
trait HasStatusBadge {
    public function badge(string $size = 'md'): string {
        $colors = [
            'low' => '#22c55e', 'medium' => '#f59e0b', 'high' => '#ef4444', 'critical' => '#991b1b',
            'info' => '#3b82f6', 'warning' => '#f59e0b', 'error' => '#ef4444',
        ];
        $sizes = ['sm' => '4px 6px', 'md' => '4px 10px', 'lg' => '6px 14px'];
        $color = $colors[$this->value] ?? '#6b7280';
        $px = $sizes[$size] ?? $sizes['md'];
        return "<span class=\"enum-badge\" style=\"display: inline-block; padding: {$px}; background: {$color}; color: white; border-radius: 4px; font-size: 12px; font-weight: 600; font-family: system-ui;\">{$this->name}</span>";
    }
}

enum TaskPriority: string {
    use HasStatusBadge;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';
}
