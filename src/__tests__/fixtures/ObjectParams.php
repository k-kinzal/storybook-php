<?php
namespace App\Components;

enum ProductStatus: string {
    case Draft = 'draft';
    case Published = 'published';
}

readonly class ProductConfig {
    public function __construct(
        public string $currency = 'USD',
        public int $decimals = 2,
    ) {}
}

readonly class ProductDisplay {
    public function __construct(
        private string $name,
        private float $price,
        private ProductConfig $config = new ProductConfig(),
        private ProductStatus $status = ProductStatus::Draft,
    ) {}

    public function render(): string {
        return "<div>{$this->name}: {$this->price}</div>";
    }
}
