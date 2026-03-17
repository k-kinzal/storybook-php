<?php
namespace App\Components;

/**
 * Demonstrates a class implementing multiple interfaces with distinct methods.
 */
interface HasTitle {
    public function getTitle(): string;
}

interface HasCount {
    public function getCount(): int;
}

interface HasSummary {
    public function summarize(): string;
}

class ItemCollection implements HasTitle, HasCount, HasSummary {
    public function __construct(
        private string $name,
        private array $items = [],
        private string $variant = 'default',
    ) {}

    public function getTitle(): string {
        return $this->name;
    }

    public function getCount(): int {
        return count($this->items);
    }

    public function summarize(): string {
        return implode(', ', $this->items);
    }

    public function render(): string {
        $count = $this->getCount();
        $bg = $this->variant === 'compact' ? '#f9fafb' : 'white';
        $padding = $this->variant === 'compact' ? '8px 12px' : '16px 20px';
        $html = "<div class=\"item-collection\" style=\"background:{$bg}; padding:{$padding}; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">";
        $html .= "<h3 style=\"margin: 0 0 8px;\">{$this->getTitle()} <small style=\"color: #9ca3af;\">({$count})</small></h3>";
        if ($count > 0) {
            $html .= "<p style=\"margin: 0; color: #6b7280;\">{$this->summarize()}</p>";
        } else {
            $html .= "<p style=\"margin: 0; color: #9ca3af; font-style: italic;\">No items</p>";
        }
        $html .= '</div>';
        return $html;
    }
}
