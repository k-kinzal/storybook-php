<?php
namespace App\Components;

/**
 * Demonstrates nested trait usage: Trait B has a method,
 * Trait A uses Trait B, and a class uses Trait A.
 * Tests recursive trait method resolution.
 */
trait HasBorder {
    public function border(string $color = '#e5e7eb', int $width = 1): string {
        return "border: {$width}px solid {$color};";
    }
}

trait HasCard {
    use HasBorder;

    public function card(string $title, string $body = ''): string {
        $borderStyle = $this->border();
        return "<div style=\"{$borderStyle} border-radius: 8px; padding: 16px;\"><h3>{$title}</h3><p>{$body}</p></div>";
    }
}

class NestedTraitWidget {
    use HasCard;

    public function __construct(private string $theme = 'default') {}
}
