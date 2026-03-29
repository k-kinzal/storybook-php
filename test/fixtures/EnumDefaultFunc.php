<?php
namespace App\Components;

enum Align: string {
    case Left = 'left';
    case Center = 'center';
    case Right = 'right';
}

function alignedBox(string $content, Align $align = Align::Left, string $bg = '#f3f4f6'): string {
    $textAlign = $align->value;
    return "<div style=\"text-align: {$textAlign}; background: {$bg};\">{$content}</div>";
}
