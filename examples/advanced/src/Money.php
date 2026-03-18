<?php
namespace App\Components;

final readonly class Money {
    public function __construct(
        private int $amount,
        private string $currency = 'USD',
    ) {}

    public static function fromCents(int $cents, string $currency = 'USD'): string {
        $dollars = number_format($cents / 100, 2);
        $symbols = ['USD' => '$', 'EUR' => "\u{20AC}", 'GBP' => "\u{00A3}", 'JPY' => "\u{00A5}"];
        $symbol = $symbols[$currency] ?? $currency;
        return "<span class=\"money money-cents\">{$symbol}{$dollars}</span>";
    }

    public static function fromDollars(float $dollars, string $currency = 'USD'): string {
        $formatted = number_format($dollars, 2);
        $symbols = ['USD' => '$', 'EUR' => "\u{20AC}", 'GBP' => "\u{00A3}", 'JPY' => "\u{00A5}"];
        $symbol = $symbols[$currency] ?? $currency;
        return "<span class=\"money money-dollars\">{$symbol}{$formatted}</span>";
    }

    public function render(): string {
        $formatted = number_format($this->amount / 100, 2);
        $symbols = ['USD' => '$', 'EUR' => "\u{20AC}", 'GBP' => "\u{00A3}", 'JPY' => "\u{00A5}"];
        $symbol = $symbols[$this->currency] ?? $this->currency;
        return "<span class=\"money\">{$symbol}{$formatted}</span>";
    }
}
