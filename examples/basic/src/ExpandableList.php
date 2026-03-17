<?php
namespace App\Components;

/**
 * Demonstrates a class implementing 3 interfaces, each with a distinct method.
 * Tests multi-interface parsing and method resolution.
 */
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
        $listItems = '';
        foreach ($this->items as $item) {
            $listItems .= "<li style=\"padding: 8px 12px; border-bottom: 1px solid #f3f4f6;\">{$item}</li>";
        }
        if ($listItems === '') {
            $listItems = "<li style=\"padding: 12px; color: #9ca3af; text-align: center;\">{$this->emptyMessage}</li>";
        }
        return <<<HTML
        <div class="expandable-list" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: system-ui; max-width: 320px;">
            <div style="padding: 12px 16px; background: #f9fafb; font-weight: 600; font-size: 14px; border-bottom: 1px solid #e5e7eb;">{$this->title}</div>
            <ul style="list-style: none; margin: 0; padding: 0; font-size: 14px;">{$listItems}</ul>
        </div>
        HTML;
    }

    public function filter(string $query = ''): string {
        $filtered = $query !== ''
            ? array_filter($this->items, fn($item) => stripos($item, $query) !== false)
            : $this->items;
        $count = count($filtered);
        $total = count($this->items);
        $listItems = '';
        foreach ($filtered as $item) {
            $highlighted = $query !== '' ? str_ireplace($query, "<mark>{$query}</mark>", $item) : $item;
            $listItems .= "<li style=\"padding: 8px 12px; border-bottom: 1px solid #f3f4f6;\">{$highlighted}</li>";
        }
        return <<<HTML
        <div class="filterable-list" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: system-ui; max-width: 320px;">
            <div style="padding: 12px 16px; background: #f0f9ff; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <strong>{$this->title}</strong>
                <span style="float: right; color: #6b7280; font-size: 12px;">{$count}/{$total}</span>
            </div>
            <ul style="list-style: none; margin: 0; padding: 0; font-size: 14px;">{$listItems}</ul>
        </div>
        HTML;
    }

    public function sort(string $direction = 'asc'): string {
        $sorted = $this->items;
        if ($direction === 'desc') {
            rsort($sorted);
        } else {
            sort($sorted);
        }
        $listItems = '';
        foreach ($sorted as $i => $item) {
            $num = $i + 1;
            $listItems .= "<li style=\"padding: 8px 12px; border-bottom: 1px solid #f3f4f6;\"><span style=\"color: #9ca3af; margin-right: 8px;\">{$num}.</span>{$item}</li>";
        }
        $arrow = $direction === 'desc' ? '↓' : '↑';
        return <<<HTML
        <div class="sortable-list" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; font-family: system-ui; max-width: 320px;">
            <div style="padding: 12px 16px; background: #fefce8; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <strong>{$this->title}</strong>
                <span style="float: right;">{$arrow} {$direction}</span>
            </div>
            <ul style="list-style: none; margin: 0; padding: 0; font-size: 14px;">{$listItems}</ul>
        </div>
        HTML;
    }
}
