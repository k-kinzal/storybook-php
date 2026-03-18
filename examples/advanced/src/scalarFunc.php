<?php
namespace App\Helpers;

/**
 * Demonstrates a standalone function that returns a scalar (int|float).
 * The runner converts scalar returns to string via resolveOutput.
 */
function calcDiscount(float $price, float $percent = 10.0): string {
    $discount = $price * ($percent / 100);
    $final = $price - $discount;

    return <<<HTML
    <div class="calc-discount" style="display: inline-block; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; background: #f9fafb;">
        <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">Original: \${$price}</div>
        <div style="color: #ef4444; font-size: 12px; margin-bottom: 4px;">Discount: -{$percent}%</div>
        <div style="font-size: 20px; font-weight: bold; color: #22c55e;">\${$final}</div>
    </div>
    HTML;
}

function formatBytes(int $bytes, int $precision = 2): string {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $factor = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
    $factor = min($factor, count($units) - 1);
    $value = $bytes / pow(1024, $factor);
    $formatted = number_format($value, $precision);
    $unit = $units[(int) $factor];

    return "<span class=\"format-bytes\" style=\"font-family: monospace; padding: 4px 10px; background: #f3f4f6; border-radius: 4px; font-size: 14px;\">{$formatted} {$unit}</span>";
}
