<?php
namespace App\Components;

/**
 * Demonstrates array type parameters.
 * Accepts typed array params in both constructor and method.
 */
class ArrayBadgeList {
    public function __construct(
        private string $title = 'Tags',
        private string $color = '#3b82f6',
    ) {}

    public function render(array $items = [], bool $inline = true): string {
        if (empty($items)) {
            return "<div class=\"badge-list\" style=\"font-family: system-ui;\"><em style=\"color: #9ca3af;\">No items</em></div>";
        }

        $display = $inline ? 'flex' : 'block';
        $gap = $inline ? 'gap: 6px;' : '';
        $margin = $inline ? '' : 'margin-bottom: 4px;';

        $badgesHtml = '';
        foreach ($items as $item) {
            $text = htmlspecialchars((string) $item);
            $badgesHtml .= "<span style=\"display: inline-block; padding: 3px 10px; border-radius: 12px; background: {$this->color}; color: white; font-size: 12px; font-weight: 600; {$margin}\">{$text}</span>";
        }

        return "<div class=\"badge-list\" style=\"font-family: system-ui;\">
            <div style=\"font-weight: 600; font-size: 14px; margin-bottom: 8px;\">{$this->title}</div>
            <div style=\"display: {$display}; flex-wrap: wrap; {$gap}\">{$badgesHtml}</div>
        </div>";
    }
}
