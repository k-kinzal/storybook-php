<?php
namespace App\Components;

readonly class Country {
    public function __construct(
        public string $code = 'US',
        public string $name = 'United States',
    ) {}
}

readonly class Address {
    public function __construct(
        public string $street,
        public string $city,
        public Country $country = new Country(),
    ) {}
}

class NestedCompose {
    public function __construct(
        private string $name,
        private Address $address,
        private string $phone = '',
    ) {}

    public function render(): string {
        return "<div>{$this->name}: {$this->address->street}, {$this->address->city}, {$this->address->country->name}</div>";
    }
}
