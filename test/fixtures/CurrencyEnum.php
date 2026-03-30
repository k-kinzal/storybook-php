<?php
namespace App\Components;

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
            self::EUR => 'E',
            self::GBP => 'P',
            self::JPY => 'Y',
        };
    }

    public function format(float $amount, int $decimals = 2): string {
        $formatted = number_format($amount, $decimals);
        return "<span>{$this->symbol()}{$formatted}</span>";
    }

    public static function table(float $amount = 100.00): string {
        $rows = '';
        foreach (self::cases() as $c) {
            $rows .= "<tr><td>{$c->value}</td><td>{$c->format($amount)}</td></tr>";
        }
        return "<table>{$rows}</table>";
    }
}
