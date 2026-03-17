<?php
namespace App\Components;

/**
 * Demonstrates an enum with methods that take multiple typed parameters.
 * Tests that non-_case args are properly matched and cast for enum methods.
 */
enum EnumMethodParams: string {
    case Badge = 'badge';
    case Pill = 'pill';
    case Tag = 'tag';

    public function render(string $label, string $color = '#6366f1', int $size = 14, bool $rounded = true): string {
        $radius = $rounded ? '999px' : '4px';
        $padding = match($this) {
            self::Badge => '2px 8px',
            self::Pill  => '4px 14px',
            self::Tag   => '3px 10px',
        };
        $border = match($this) {
            self::Badge => 'none',
            self::Pill  => 'none',
            self::Tag   => "1px solid {$color}",
        };
        $bg = match($this) {
            self::Badge => $color,
            self::Pill  => "{$color}18",
            self::Tag   => 'transparent',
        };
        $fg = match($this) {
            self::Badge => 'white',
            self::Pill  => $color,
            self::Tag   => $color,
        };

        return "<span class=\"emp emp-{$this->value}\" style=\"display:inline-block;padding:{$padding};background:{$bg};color:{$fg};border:{$border};border-radius:{$radius};font-size:{$size}px;font-weight:500;font-family:system-ui;\">{$label}</span>";
    }

    public static function showcase(string $label = 'Example'): string {
        $html = '<div class="emp-showcase" style="display:flex;gap:12px;align-items:center;">';
        foreach (self::cases() as $case) {
            $html .= $case->render($label);
        }
        $html .= '</div>';
        return $html;
    }
}
