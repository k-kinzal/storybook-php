<?php
namespace App\Components;

enum Currency: string {
    case USD = 'USD';
    case EUR = 'EUR';
    case GBP = 'GBP';
    case JPY = 'JPY';

    public function symbol(): string {
        return match ($this) {
            self::USD => '$',
            self::EUR => '€',
            self::GBP => '£',
            self::JPY => '¥',
        };
    }
}

class PriceConfig {
    public function __construct(
        public readonly int $decimals = 2,
        public readonly string $thousandsSep = ',',
        public readonly string $decimalPoint = '.',
    ) {}
}

class TypedProduct {
    public function __construct(
        private string $name,
        private float $price,
        private Currency $currency = Currency::USD,
        private PriceConfig $config = new PriceConfig(),
        private ?string $description = null,
    ) {}

    public function render(): string {
        $symbol = $this->currency->symbol();
        $formatted = $symbol . number_format(
            $this->price,
            $this->config->decimals,
            $this->config->decimalPoint,
            $this->config->thousandsSep,
        );
        $desc = $this->description !== null
            ? "<p style=\"margin: 4px 0 0; color: #6b7280; font-size: 13px;\">{$this->description}</p>"
            : '';
        return "<div class=\"product\" style=\"padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; max-width: 280px;\"><h3 style=\"margin: 0 0 8px; font-size: 16px;\">{$this->name}</h3><span class=\"product-price\" style=\"font-size: 24px; font-weight: 700; color: #111827;\">{$formatted}</span>{$desc}</div>";
    }
}
