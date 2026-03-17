<?php
namespace App\Components;

/**
 * Demonstrates the `iterable` type hint in parameters.
 * Accepts both arrays and any Traversable for maximum flexibility.
 */
class ItemGrid {
    public function __construct(
        private string $title = 'Items',
        private string $emptyMessage = 'No items',
    ) {}

    public function render(iterable $items, string $style = 'list'): string {
        $collected = [];
        foreach ($items as $item) {
            $collected[] = htmlspecialchars((string) $item);
        }

        if (empty($collected)) {
            return "<div class=\"item-empty\" style=\"padding: 16px; color: #9ca3af; font-family: system-ui;\">{$this->emptyMessage}</div>";
        }

        $header = "<h4 style=\"margin: 0 0 8px; color: #111827; font-family: system-ui;\">{$this->title}</h4>";

        if ($style === 'grid') {
            $cards = implode('', array_map(fn($item) =>
                "<div style=\"padding: 8px 14px; background: #f3f4f6; border-radius: 6px; font-size: 13px;\">{$item}</div>",
                $collected
            ));
            return "{$header}<div class=\"item-grid\" style=\"display: flex; flex-wrap: wrap; gap: 8px; font-family: system-ui;\">{$cards}</div>";
        }

        $lis = implode('', array_map(fn($item) => "<li style=\"padding: 4px 0;\">{$item}</li>", $collected));
        return "{$header}<ul class=\"item-list\" style=\"margin: 0; padding-left: 20px; font-family: system-ui;\">{$lis}</ul>";
    }
}
