<?php
namespace App\Components;

enum ProductStatus: string {
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}

readonly class ProductConfig {
    public function __construct(
        public string $currency = 'USD',
        public int $decimals = 2,
    ) {}
}

readonly class ProductCard {
    public function __construct(
        private string $name,
        private float $price,
        private ProductConfig $config = new ProductConfig(),
        private ProductStatus $status = ProductStatus::Draft,
    ) {}

    public function render(): string {
        $formattedPrice = number_format($this->price, $this->config->decimals);
        $statusBadge = "<span class=\"badge badge-{$this->status->value}\">{$this->status->name}</span>";
        return <<<HTML
        <div class="product-card">
            <h3>{$this->name} {$statusBadge}</h3>
            <p class="price">{$this->config->currency} {$formattedPrice}</p>
        </div>
        HTML;
    }
}
