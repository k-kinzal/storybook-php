<?php
namespace App\Components;

enum Size {
    case Small;
    case Medium;
    case Large;
    case ExtraLarge;

    public function button(string $text, string $color = '#3b82f6'): string {
        $sizes = [
            'Small' => 'padding: 4px 8px; font-size: 12px;',
            'Medium' => 'padding: 8px 16px; font-size: 14px;',
            'Large' => 'padding: 12px 24px; font-size: 16px;',
            'ExtraLarge' => 'padding: 16px 32px; font-size: 18px;',
        ];
        $style = $sizes[$this->name] ?? '';
        return "<button class=\"btn btn-{$this->name}\" style=\"{$style} background-color: {$color}; color: white; border: none; border-radius: 4px; cursor: pointer;\">{$text}</button>";
    }
}
