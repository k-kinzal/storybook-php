<?php

namespace App\Components;

class TagCloud {
    public function __construct(
        private array $tags,
        private string $baseSize = '14',
    ) {}

    public function render(int $maxWeight = 5, string $unit = 'px'): string
    {
        if (empty($this->tags)) {
            return '<div class="tag-cloud tag-cloud-empty">No tags</div>';
        }

        $html = '<div class="tag-cloud">';
        foreach ($this->tags as $tag) {
            $label = is_array($tag) ? ($tag['label'] ?? '') : (string) $tag;
            $weight = is_array($tag) ? min((int) ($tag['weight'] ?? 1), $maxWeight) : 1;
            $fontSize = (int) $this->baseSize + ($weight * 2);
            $html .= "<span class=\"tag tag-weight-{$weight}\" style=\"font-size: {$fontSize}{$unit}\">{$label}</span> ";
        }
        $html .= '</div>';
        return $html;
    }
}
