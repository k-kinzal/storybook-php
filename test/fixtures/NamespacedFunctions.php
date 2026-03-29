<?php
namespace App\Helpers;

function pill(string $text, bool $outline = false): string {
    return "<span class=\"pill\">{$text}</span>";
}

function tag(string $label, string $color = 'blue'): string {
    return "<span class=\"tag tag-{$color}\">{$label}</span>";
}
