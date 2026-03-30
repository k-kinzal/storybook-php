<?php
namespace App\Components;

readonly class ProductCard {
    public function __construct(
        public string $name,
        public float $price,
        public string $currency = 'USD',
        private int $decimals = 2,
    ) {}

    public function render(): string {
        return "<div class=\"product\">{$this->name}: {$this->currency}{$this->price}</div>";
    }
}
