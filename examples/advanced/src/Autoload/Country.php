<?php
namespace App\Components\Autoload;

readonly class Country {
    public function __construct(
        public string $code = 'US',
        public string $name = 'United States',
    ) {}
}
