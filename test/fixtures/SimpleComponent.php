<?php
namespace App\Components;

class SimpleComponent {
    public function __construct(private string $name, private int $age = 25) {}

    public function render(): string {
        return "<div>{$this->name} is {$this->age}</div>";
    }
}
