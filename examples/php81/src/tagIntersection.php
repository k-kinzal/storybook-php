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

function renderIntersectionTag(Labeled&Colored $item, string $size = 'md'): string {
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
    return "<span style=\"display: inline-block; padding: {$padding}; background: {$item->color()}; color: white; border-radius: 4px; font-size: {$fontSize}; font-weight: 600; font-family: system-ui;\">{$item->label()}</span>";
}
