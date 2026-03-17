<?php
namespace App\Components;

/**
 * Demonstrates intersection type parameters.
 * The parser extracts intersection types like Renderable&Countable.
 */
interface HasLabel {
    public function label(): string;
}

interface HasColor {
    public function color(): string;
}

class IntersectionBadge {
    public function __construct(
        private string $separator = ' | ',
    ) {}

    public function render(string $label, string $color = '#3b82f6'): string {
        return "<span class=\"badge\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-weight: bold; font-size: 13px;\">{$label}</span>";
    }
}
