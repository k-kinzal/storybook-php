<?php

namespace App\Components;

/**
 * Demonstrates mixed, iterable, and callable type parameters.
 */
class DataRenderer {
    public function __construct(
        private iterable $items = [],
        private string $wrapper = 'div',
    ) {}

    public function render(mixed $transform = null): string
    {
        $html = "<{$this->wrapper} class=\"data-renderer\">";

        foreach ($this->items as $item) {
            $content = is_array($item) ? implode(', ', $item) : (string) $item;
            if ($transform !== null && is_string($transform)) {
                $content = match ($transform) {
                    'upper' => strtoupper($content),
                    'lower' => strtolower($content),
                    'reverse' => strrev($content),
                    default => $content,
                };
            }
            $html .= "<div class=\"data-item\">{$content}</div>";
        }

        if (empty((array) $this->items)) {
            $html .= '<div class="data-empty">No data</div>';
        }

        $html .= "</{$this->wrapper}>";
        return $html;
    }
}
