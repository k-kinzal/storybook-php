<?php
namespace App\Components;

/**
 * Demonstrates an enum with complex methods including methods that take
 * other enum-typed parameters, multiple instance methods, and static methods.
 * Tests enum method resolution with diverse parameter types.
 */
enum Permission: string {
    case Read = 'read';
    case Write = 'write';
    case Delete = 'delete';
    case Admin = 'admin';

    public function badge(): string {
        $colors = [
            'read'   => ['#dbeafe', '#1d4ed8'],
            'write'  => ['#dcfce7', '#15803d'],
            'delete' => ['#fef2f2', '#b91c1c'],
            'admin'  => ['#faf5ff', '#7e22ce'],
        ];
        [$bg, $fg] = $colors[$this->value] ?? ['#f3f4f6', '#374151'];
        $icons = ['read' => '👁', 'write' => '✏️', 'delete' => '🗑', 'admin' => '👑'];
        $icon = $icons[$this->value] ?? '';
        return "<span class=\"perm-badge\" style=\"display: inline-flex; align-items: center; gap: 4px; padding: 4px 12px; border-radius: 6px; background: {$bg}; color: {$fg}; font-size: 13px; font-weight: 600; font-family: system-ui;\">{$icon} {$this->name}</span>";
    }

    public function includes(string $action): string {
        $hierarchy = [
            'admin'  => ['read', 'write', 'delete', 'admin'],
            'delete' => ['read', 'write', 'delete'],
            'write'  => ['read', 'write'],
            'read'   => ['read'],
        ];
        $allowed = $hierarchy[$this->value] ?? [];
        $has = in_array($action, $allowed, true);
        $status = $has ? 'Allowed' : 'Denied';
        $color = $has ? '#22c55e' : '#ef4444';
        $icon = $has ? '✓' : '✗';
        return <<<HTML
        <div class="perm-check" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-family: system-ui; font-size: 14px;">
            {$this->badge()}
            <span style="color: #6b7280;">→ {$action}</span>
            <span style="color: {$color}; font-weight: bold;">{$icon} {$status}</span>
        </div>
        HTML;
    }

    public static function matrix(): string {
        $actions = ['read', 'write', 'delete', 'admin'];
        $header = '<tr><th style="padding: 6px 12px; text-align: left;"></th>';
        foreach ($actions as $a) {
            $header .= "<th style=\"padding: 6px 12px; font-size: 12px; text-transform: uppercase; color: #6b7280;\">{$a}</th>";
        }
        $header .= '</tr>';
        $rows = '';
        foreach (self::cases() as $perm) {
            $hierarchy = [
                'admin'  => ['read', 'write', 'delete', 'admin'],
                'delete' => ['read', 'write', 'delete'],
                'write'  => ['read', 'write'],
                'read'   => ['read'],
            ];
            $allowed = $hierarchy[$perm->value] ?? [];
            $rows .= "<tr><td style=\"padding: 6px 12px;\">{$perm->badge()}</td>";
            foreach ($actions as $a) {
                $has = in_array($a, $allowed, true);
                $icon = $has ? '✓' : '—';
                $color = $has ? '#22c55e' : '#d1d5db';
                $rows .= "<td style=\"padding: 6px 12px; text-align: center; color: {$color}; font-weight: bold;\">{$icon}</td>";
            }
            $rows .= '</tr>';
        }
        return "<table class=\"perm-matrix\" style=\"border-collapse: collapse; font-family: system-ui; font-size: 14px; border: 1px solid #e5e7eb; border-radius: 8px;\">{$header}{$rows}</table>";
    }
}
