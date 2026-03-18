<?php
namespace App\Components;

/**
 * Demonstrates a backed enum with multiple instance and static methods.
 * Includes symbol(), format(), label(), and a static table() method.
 */
enum Currency: string {
    case USD = 'USD';
    case EUR = 'EUR';
    case GBP = 'GBP';
    case JPY = 'JPY';

    public function label(): string {
        return "{$this->symbol()} ({$this->value})";
    }

    public function symbol(): string {
        return match($this) {
            self::USD => '$',
            self::EUR => "\u{20AC}",
            self::GBP => "\u{00A3}",
            self::JPY => "\u{00A5}",
        };
    }

    public function format(float $amount, int $decimals = 2): string {
        $formatted = number_format($amount, $decimals);
        $sym = $this->symbol();
        return "<span class=\"currency\" style=\"font-family: system-ui; font-size: 16px; font-weight: 600; color: #111827;\">{$sym}{$formatted} <small style=\"color: #9ca3af; font-weight: normal;\">{$this->value}</small></span>";
    }

    public static function table(float $amount = 100.00): string {
        $rows = '';
        foreach (self::cases() as $c) {
            $rows .= "<tr><td style=\"padding: 8px;\">{$c->value}</td><td style=\"padding: 8px;\">{$c->symbol()}</td><td style=\"padding: 8px; text-align: right;\">{$c->format($amount)}</td></tr>";
        }
        return "<table style=\"border-collapse: collapse; font-family: system-ui; width: 100%; max-width: 400px;\"><thead><tr style=\"border-bottom: 2px solid #e5e7eb;\"><th style=\"padding: 8px; text-align: left;\">Code</th><th style=\"padding: 8px; text-align: left;\">Symbol</th><th style=\"padding: 8px; text-align: right;\">Formatted</th></tr></thead><tbody>{$rows}</tbody></table>";
    }
}
