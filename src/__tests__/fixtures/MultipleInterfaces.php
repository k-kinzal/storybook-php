<?php
namespace App\Components;

interface Togglable {
    public function toggle(bool $open): string;
}

interface Searchable {
    public function search(string $query): string;
}

class Dropdown implements Togglable, Searchable {
    public function __construct(
        private string $label,
        private array $items = [],
        private ?string $placeholder = null,
    ) {}

    public function toggle(bool $open = false): string
    {
        return "toggled";
    }

    public function search(string $query = ''): string
    {
        return "searched";
    }
}
