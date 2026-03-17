<?php
namespace App\Components;

interface Expandable {
    public function expand(): string;
}

interface Filterable {
    public function filter(string $query): string;
}

interface Sortable {
    public function sort(string $direction): string;
}

class ExpandableList implements Expandable, Filterable, Sortable {
    public function __construct(
        private string $title,
        private array $items = [],
        private string $emptyMessage = 'No items',
    ) {}

    public function expand(): string {
        return "<ul>" . implode('', array_map(fn($i) => "<li>{$i}</li>", $this->items)) . "</ul>";
    }

    public function filter(string $query = ''): string {
        $filtered = $query !== '' ? array_filter($this->items, fn($i) => stripos($i, $query) !== false) : $this->items;
        return "<ul>" . implode('', array_map(fn($i) => "<li>{$i}</li>", $filtered)) . "</ul>";
    }

    public function sort(string $direction = 'asc'): string {
        $sorted = $this->items;
        $direction === 'desc' ? rsort($sorted) : sort($sorted);
        return "<ol>" . implode('', array_map(fn($i) => "<li>{$i}</li>", $sorted)) . "</ol>";
    }
}
