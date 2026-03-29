<?php
namespace App\Components;

/**
 * Demonstrates a class implementing multiple interfaces with distinct methods.
 */
interface Renderable {
    public function render(): string;
}

interface Countable2 {
    public function count(): int;
}

interface Describable {
    public function describe(): string;
}

class MultiInterfaceClass implements Renderable, Countable2, Describable {
    public function __construct(
        private string $name,
        private array $items = [],
    ) {}

    public function render(): string {
        $count = $this->count();
        return "<div class=\"multi-impl\"><h3>{$this->name} ({$count})</h3>{$this->describe()}</div>";
    }

    public function count(): int {
        return count($this->items);
    }

    public function describe(): string {
        $list = implode(', ', $this->items);
        return "<p class=\"description\">{$list}</p>";
    }
}
