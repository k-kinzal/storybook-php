<?php
namespace App\Components;

/**
 * Demonstrates intersection type (Countable&Traversable would require
 * a real implementation; here we show array + complex type handling).
 * Also demonstrates method chaining via fluent interface pattern.
 */
class FlexGrid {
    private array $items = [];
    private int $columns = 3;
    private string $gap = '16px';

    public function __construct(
        private string $id = 'grid',
    ) {}

    public function configure(int $columns = 3, string $gap = '16px'): self {
        $this->columns = $columns;
        $this->gap = $gap;
        return $this;
    }

    public function render(array $items, int $columns = 3, string $gap = '16px'): string {
        if (empty($items)) {
            return "<div id=\"{$this->id}\" class=\"flex-grid flex-grid-empty\">No items</div>";
        }

        $html = "<div id=\"{$this->id}\" class=\"flex-grid\" style=\"display: grid; grid-template-columns: repeat({$columns}, 1fr); gap: {$gap};\">";
        foreach ($items as $item) {
            $content = is_array($item) ? ($item['content'] ?? '') : htmlspecialchars((string) $item);
            $html .= "<div class=\"flex-grid-item\" style=\"padding: 12px; border: 1px solid #e5e7eb; border-radius: 6px;\">{$content}</div>";
        }
        $html .= "</div>";
        return $html;
    }
}
