<?php
namespace App\Components;

/**
 * Demonstrates variadic constructor parameters.
 * The constructor accepts a spread of items.
 */
class StackList {
    /** @var string[] */
    private array $items;

    public function __construct(
        private string $title = 'Stack',
        private string $direction = 'vertical',
        string ...$items,
    ) {
        $this->items = $items;
    }

    public function render(): string {
        $flexDir = $this->direction === 'horizontal' ? 'row' : 'column';
        $gap = $this->direction === 'horizontal' ? '8px' : '4px';

        $itemsHtml = '';
        foreach ($this->items as $item) {
            $itemsHtml .= "<div style=\"padding: 8px 12px; background: #f1f5f9; border-radius: 6px; font-size: 14px;\">{$item}</div>";
        }

        if ($itemsHtml === '') {
            $itemsHtml = '<div style="padding: 8px 12px; color: #9ca3af; font-style: italic;">No items</div>';
        }

        return "<div class=\"stack-list\" style=\"font-family: system-ui;\">
            <h4 style=\"margin: 0 0 8px 0;\">{$this->title}</h4>
            <div style=\"display: flex; flex-direction: {$flexDir}; gap: {$gap};\">{$itemsHtml}</div>
        </div>";
    }
}
