<?php

namespace App\Components;

class TagRenderer
{
    public function __construct(
        private array $items,
    ) {}

    public function render(): string
    {
        return implode(', ', array_map(fn($i) => "<b>{$i}</b>", $this->items));
    }
}
