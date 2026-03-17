<?php
namespace App\Components;

/**
 * Demonstrates a standalone function with an enum-typed parameter
 * and a default enum value.
 */
enum Align: string {
    case Left = 'left';
    case Center = 'center';
    case Right = 'right';
}

function alignedBox(string $content, Align $align = Align::Left, string $bg = '#f3f4f6'): string {
    $textAlign = $align->value;
    return "<div class=\"aligned-box\" style=\"text-align: {$textAlign}; background: {$bg}; padding: 16px 20px; border-radius: 8px; font-family: system-ui; color: #111827;\">{$content}</div>";
}
