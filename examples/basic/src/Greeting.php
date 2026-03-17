<?php
namespace App\Components;

class Greeting {
    public function __construct(
        private string $name,
        private string $greeting = 'Hello',
    ) {}

    public function render(): string {
        return "<div class=\"greeting\"><h2>{$this->greeting}, {$this->name}!</h2></div>";
    }
}
