<?php
namespace App\Helpers;

function formatCurrency(float $amount, string $currency = 'USD', int $decimals = 2): string {
    $symbols = ['USD' => '$', 'EUR' => '€', 'GBP' => '£', 'JPY' => '¥'];
    $symbol = $symbols[$currency] ?? $currency;
    return "<span>{$symbol}" . number_format($amount, $decimals) . "</span>";
}

function formatDate(string $date, string $format = 'long'): string {
    $ts = strtotime($date);
    if ($ts === false) return "<span>Invalid</span>";
    $formatted = match ($format) {
        'short' => date('m/d/y', $ts),
        'iso'   => date('Y-m-d', $ts),
        default => date('F j, Y', $ts),
    };
    return "<time>{$formatted}</time>";
}

function formatFileSize(int $bytes, int $precision = 1): string {
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $factor = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
    $factor = min($factor, count($units) - 1);
    return number_format($bytes / pow(1024, $factor), $precision) . ' ' . $units[(int)$factor];
}
