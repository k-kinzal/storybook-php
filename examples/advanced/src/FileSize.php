<?php
namespace App\Components;

/**
 * Demonstrates standalone functions with int|float union type return,
 * and a no-constructor class with only static methods.
 */
class FileSize {
    public static function badge(int|float $bytes, string $variant = 'default'): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = (float) $bytes;
        $unit = 0;
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        $formatted = $unit === 0 ? (string)(int)$size : number_format($size, 1);

        $colors = match ($variant) {
            'success' => ['#dcfce7', '#166534', '#bbf7d0'],
            'warning' => ['#fef9c3', '#854d0e', '#fde68a'],
            'danger'  => ['#fef2f2', '#991b1b', '#fecaca'],
            default   => ['#f3f4f6', '#374151', '#e5e7eb'],
        };
        [$bg, $fg, $border] = $colors;

        return "<span style=\"display: inline-block; padding: 3px 10px; background: {$bg}; color: {$fg}; border: 1px solid {$border}; border-radius: 12px; font-size: 12px; font-weight: 600; font-family: monospace;\">{$formatted} {$units[$unit]}</span>";
    }

    public static function bar(int|float $used, int|float $total, string $label = 'Storage'): string {
        $pct = $total > 0 ? min(100, ($used / $total) * 100) : 0;
        $color = $pct > 90 ? '#ef4444' : ($pct > 70 ? '#f59e0b' : '#22c55e');
        $usedFmt = self::formatBytes($used);
        $totalFmt = self::formatBytes($total);

        return <<<HTML
        <div style="font-family: system-ui; max-width: 300px;">
            <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                <span style="font-weight: 600;">{$label}</span>
                <span style="color: #6b7280;">{$usedFmt} / {$totalFmt}</span>
            </div>
            <div style="height: 8px; background: #f3f4f6; border-radius: 4px; overflow: hidden;">
                <div style="width: {$pct}%; height: 100%; background: {$color}; border-radius: 4px; transition: width 0.3s;"></div>
            </div>
        </div>
        HTML;
    }

    private static function formatBytes(int|float $bytes): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $size = (float) $bytes;
        $unit = 0;
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        return ($unit === 0 ? (string)(int)$size : number_format($size, 1)) . ' ' . $units[$unit];
    }
}
