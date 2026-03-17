<?php
namespace App\Helpers;

function calcDiscount(float $price, float $percent = 10.0): string {
    $final = $price - ($price * $percent / 100);
    return "<span>\${$final}</span>";
}

function formatBytes(int $bytes, int $precision = 2): string {
    $units = ['B', 'KB', 'MB', 'GB'];
    $factor = $bytes > 0 ? floor(log($bytes, 1024)) : 0;
    $value = $bytes / pow(1024, $factor);
    return number_format($value, $precision) . ' ' . $units[(int)$factor];
}
