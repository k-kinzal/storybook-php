<?php
namespace App\Components;

class FileSize {
    public static function badge(int|float $bytes, string $variant = 'default'): string {
        $units = ['B', 'KB', 'MB', 'GB'];
        $size = (float) $bytes;
        $unit = 0;
        while ($size >= 1024 && $unit < count($units) - 1) {
            $size /= 1024;
            $unit++;
        }
        $formatted = $unit === 0 ? (string)(int)$size : number_format($size, 1);
        return "<span class=\"filesize filesize-{$variant}\">{$formatted} {$units[$unit]}</span>";
    }

    public static function bar(int|float $used, int|float $total, string $label = 'Storage'): string {
        $pct = $total > 0 ? round(($used / $total) * 100, 1) : 0;
        return "<div class=\"bar\"><span>{$label}</span><span>{$pct}%</span></div>";
    }
}
