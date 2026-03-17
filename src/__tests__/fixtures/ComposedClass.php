<?php
namespace App\Components;

/**
 * Two classes in the same file where one is used as a typed
 * constructor parameter of the other. Tests recursive class instantiation.
 */
class Address {
    public function __construct(
        public string $city = 'Tokyo',
        public string $country = 'Japan',
    ) {}
}

class Contact {
    public function __construct(
        private string $name,
        private Address $address = new Address(),
    ) {}

    public function render(): string {
        return "<div>{$this->name} — {$this->address->city}, {$this->address->country}</div>";
    }
}
