<?php
namespace App\Components;

/**
 * Demonstrates a utility class with multiple static methods,
 * each usable as an independent story callable.
 */
class MarkupHelper {
    public static function button(string $label, string $variant = 'primary', bool $disabled = false): string {
        $colors = match ($variant) {
            'primary'   => 'background: #3b82f6; color: white; border-color: #3b82f6;',
            'secondary' => 'background: #6b7280; color: white; border-color: #6b7280;',
            'outline'   => 'background: transparent; color: #3b82f6; border-color: #3b82f6;',
            'danger'    => 'background: #ef4444; color: white; border-color: #ef4444;',
            default     => 'background: #e5e7eb; color: #111827; border-color: #e5e7eb;',
        };
        $disabledAttr = $disabled ? ' disabled' : '';
        $opacity = $disabled ? ' opacity: 0.5; cursor: not-allowed;' : ' cursor: pointer;';
        return "<button class=\"markup-btn markup-btn-{$variant}\" style=\"padding: 8px 20px; border: 2px solid; border-radius: 6px; font-size: 14px; font-weight: 600; {$colors}{$opacity}\"{$disabledAttr}>{$label}</button>";
    }

    public static function link(string $text, string $href = '#', bool $external = false): string {
        $target = $external ? ' target="_blank" rel="noopener noreferrer"' : '';
        $icon = $external ? ' &#8599;' : '';
        return "<a href=\"{$href}\" class=\"markup-link\" style=\"color: #3b82f6; text-decoration: underline; font-size: 14px;\"{$target}>{$text}{$icon}</a>";
    }

    public static function image(string $alt, int $width = 200, int $height = 150, string $bgColor = '#e5e7eb'): string {
        return "<div class=\"markup-img\" style=\"width: {$width}px; height: {$height}px; background: {$bgColor}; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 13px;\">{$alt}</div>";
    }
}
