<?php
namespace App\Components;

/**
 * Demonstrates standalone functions with intersection type parameters.
 * Tests parser extraction of intersection types (A&B) in function params.
 */
interface Labeled {
    public function label(): string;
}

interface Colored {
    public function color(): string;
}

function renderIntersectionTag(string $label = 'Tag', string $color = '#3b82f6', string $size = 'md'): string {
    $fontSize = match ($size) {
        'sm' => '11px',
        'lg' => '16px',
        default => '13px',
    };
    $padding = match ($size) {
        'sm' => '2px 6px',
        'lg' => '6px 14px',
        default => '3px 10px',
    };
    return "<span style=\"display: inline-block; padding: {$padding}; background: {$color}; color: white; border-radius: 4px; font-size: {$fontSize}; font-weight: 600; font-family: system-ui;\">{$label}</span>";
}

/**
 * Render a tag from an object implementing both Labeled and Colored
 * (intersection type, PHP 8.1+).
 */
function renderIntersectionTagFromItem(Labeled&Colored $item, string $size = 'md'): string {
    return renderIntersectionTag($item->label(), $item->color(), $size);
}
