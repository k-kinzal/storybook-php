<?php
namespace App\Helpers;

/**
 * Multiple standalone functions in one file, each imported by separate stories.
 * Tests multi-function parsing and independent function module generation.
 */
function formatCurrency(float $amount, string $currency = 'USD', int $decimals = 2): string {
    $symbols = ['USD' => '$', 'EUR' => '€', 'GBP' => '£', 'JPY' => '¥'];
    $symbol = $symbols[$currency] ?? $currency;
    $formatted = number_format($amount, $decimals);
    return "<span class=\"currency\" style=\"font-family: monospace; font-size: 18px; font-weight: bold; color: #111827;\">{$symbol}{$formatted}</span>";
}

function formatDate(string $date, string $format = 'long'): string {
    $ts = strtotime($date);
    if ($ts === false) {
        return "<span style=\"color: #ef4444;\">Invalid date</span>";
    }
    $formatted = match ($format) {
        'short' => date('m/d/y', $ts),
        'iso'   => date('Y-m-d', $ts),
        'time'  => date('H:i:s', $ts),
        default => date('F j, Y', $ts),
    };
    return "<time class=\"formatted-date\" style=\"font-family: system-ui; font-size: 14px; color: #374151;\" datetime=\"" . date('Y-m-d', $ts) . "\">{$formatted}</time>";
}

function formatFileSize(int $bytes, int $precision = 1): string {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $factor = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
    $factor = min($factor, count($units) - 1);
    $size = number_format($bytes / pow(1024, $factor), $precision);

    $barWidth = min(100, ($factor / 4) * 100 + ($bytes > 0 ? 10 : 0));
    $color = match (true) {
        $factor >= 3 => '#ef4444',
        $factor >= 2 => '#f59e0b',
        $factor >= 1 => '#3b82f6',
        default      => '#22c55e',
    };

    return <<<HTML
    <div class="file-size" style="font-family: system-ui; font-size: 14px;">
        <div style="margin-bottom: 4px;"><strong>{$size}</strong> {$units[(int)$factor]}</div>
        <div style="height: 6px; background: #e5e7eb; border-radius: 3px; width: 120px;">
            <div style="height: 100%; width: {$barWidth}%; background: {$color}; border-radius: 3px;"></div>
        </div>
    </div>
    HTML;
}
