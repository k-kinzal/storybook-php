<?php
namespace App\Components;

/**
 * Demonstrates intersection type parameters in PHP 8.1.
 * Uses HasLabel&HasColor intersection type for the badge rendering,
 * with a separate string-based render path for Storybook args.
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

    /**
     * Render a badge from a string label and color.
     * From Storybook, string values are passed directly.
     */
    public function render(
        string $label = 'default',
        string $color = '#3b82f6',
    ): string {
        return "<span class=\"badge\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-weight: bold; font-size: 13px;\">{$label}</span>";
    }

    /**
     * Render a badge from an object implementing both HasLabel and HasColor
     * (intersection type, PHP 8.1+).
     */
    public function renderFromTag(
        HasLabel&HasColor $tag,
    ): string {
        return $this->render($tag->label(), $tag->color());
    }
}
