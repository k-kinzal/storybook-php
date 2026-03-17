<?php
namespace App\Components;

class MarkupHelper {
    public static function button(string $label, string $variant = 'primary'): string {
        return "<button class=\"btn btn-{$variant}\">{$label}</button>";
    }

    public static function link(string $text, string $href = '#', bool $external = false): string {
        $target = $external ? ' target="_blank"' : '';
        return "<a href=\"{$href}\"{$target}>{$text}</a>";
    }

    public static function image(string $alt, int $width = 200, int $height = 150): string {
        return "<div style=\"width: {$width}px; height: {$height}px;\">{$alt}</div>";
    }
}
