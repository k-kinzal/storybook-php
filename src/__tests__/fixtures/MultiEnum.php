<?php
namespace App\Components;

enum TextAlign: string {
    case Left = 'left';
    case Center = 'center';
    case Right = 'right';

    public function preview(string $text = 'Sample'): string {
        return "<div style=\"text-align: {$this->value}\">{$text}</div>";
    }
}

enum FontWeight: string {
    case Light = '300';
    case Normal = '400';
    case Bold = '700';
    case Black = '900';

    public function preview(string $text = 'Text'): string {
        return "<div style=\"font-weight: {$this->value}\">{$text}</div>";
    }
}
