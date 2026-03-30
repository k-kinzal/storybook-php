<?php

namespace App\Components;

/**
 * Component with array parameter — typeMap.files[*].args provides elementType
 * so the runner can cast array elements properly.
 */
class TagList
{
    public function __construct(
        private array $tags,
        private string $color = '#3b82f6',
    ) {}

    public function render(): string
    {
        $html = '<div style="display: flex; gap: 6px; flex-wrap: wrap; font-family: system-ui;">';
        foreach ($this->tags as $tag) {
            $html .= "<span style=\"display: inline-block; padding: 2px 10px; border-radius: 12px; background: {$this->color}; color: white; font-size: 12px;\">{$tag}</span>";
        }
        $html .= '</div>';
        return $html;
    }
}
