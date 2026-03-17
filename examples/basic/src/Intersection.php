<?php
namespace App\Components;

/**
 * Demonstrates intersection type parameters in PHP 8.1.
 * Uses (HasLabel&HasColor)|string as a DNF-style intersection,
 * with a string fallback so it can be used from Storybook args.
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
     * The $tag parameter uses an intersection type with a string fallback.
     * From Storybook, a string value is passed; in PHP code, an object
     * implementing both HasLabel and HasColor could be used.
     */
    public function render(
        (HasLabel&HasColor)|string $tag = 'default',
        string $color = '#3b82f6',
    ): string {
        if (is_string($tag)) {
            $label = $tag;
        } else {
            $label = $tag->label();
            $color = $tag->color();
        }

        return "<span class=\"badge\" style=\"display: inline-block; padding: 4px 12px; border-radius: 12px; background: {$color}; color: white; font-weight: bold; font-size: 13px;\">{$label}</span>";
    }
}
