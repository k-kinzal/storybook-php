<?php
namespace App\Components;

interface Renderable {
    public function render(): string;
}

interface Countable {
    public function count(): int;
}

class Collection {
    public function __construct(
        private Renderable&Countable $source,
        private string $title = 'Items',
    ) {}

    public function render(): string
    {
        return "<div>{$this->title}: {$this->source->count()} items</div>";
    }
}
