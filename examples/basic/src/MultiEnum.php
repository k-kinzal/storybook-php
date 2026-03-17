<?php
namespace App\Components;

/**
 * Demonstrates multiple enums in a single file, each independently exportable.
 * Similar to multi-class files but with enums.
 */
enum TextAlign: string {
    case Left = 'left';
    case Center = 'center';
    case Right = 'right';

    public function preview(string $text = 'Sample text'): string {
        return "<div class=\"text-align-preview\" style=\"text-align: {$this->value}; padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui; min-width: 200px;\">{$text}</div>";
    }
}

enum FontWeight: string {
    case Light = '300';
    case Normal = '400';
    case Bold = '700';
    case Black = '900';

    public function preview(string $text = 'The quick brown fox'): string {
        return "<div class=\"font-weight-preview\" style=\"font-weight: {$this->value}; font-size: 18px; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\">{$text} <span style=\"color: #6b7280; font-size: 12px; font-weight: normal;\">({$this->name}: {$this->value})</span></div>";
    }
}
