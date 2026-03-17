<?php
namespace App\Components;

/**
 * Demonstrates enum with constants.
 * PHP enums can define constants alongside cases.
 */
enum EnumConstant: string {
    const DEFAULT_FORMAT = 'badge';

    case Success = 'success';
    case Warning = 'warning';
    case Danger = 'danger';

    public function badge(): string {
        $colors = [
            'success' => '#22c55e',
            'warning' => '#f59e0b',
            'danger'  => '#ef4444',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        return "<span class=\"enum-badge\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-weight: 600; font-size: 13px;\">{$this->name}</span>";
    }

    public static function all(string $separator = ' '): string {
        $parts = [];
        foreach (self::cases() as $case) {
            $parts[] = $case->badge();
        }
        return '<div class="enum-constant-all" style="display: flex; gap: 8px; align-items: center;">' . implode($separator, $parts) . '</div>';
    }
}
