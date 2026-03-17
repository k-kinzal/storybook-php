<?php
namespace App\Helpers;

function pill(string $text, bool $outline = false): string {
    $cls = $outline ? 'pill pill-outline' : 'pill';
    return "<span class=\"{$cls}\">{$text}</span>";
}

function tag(string $label, string $color = 'blue'): string {
    return "<span class=\"tag tag-{$color}\" style=\"display: inline-block; padding: 2px 10px; border-radius: 4px; background-color: {$color}; color: white; font-size: 13px;\">{$label}</span>";
}
