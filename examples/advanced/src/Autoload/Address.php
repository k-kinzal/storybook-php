<?php
namespace App\Components\Autoload;

readonly class Address {
    public function __construct(
        public string $street,
        public string $city,
        public Country $country = new Country(),
    ) {}
}
