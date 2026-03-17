<?php
namespace App\Components;

class Formatter {
    public function __construct(private string $locale = 'en_US') {}

    public function formatCurrency(float $amount, string $symbol = '$'): string {
        return "<span class=\"currency\">{$symbol}" . number_format($amount, 2) . "</span>";
    }
}
