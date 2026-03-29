<?php
function badge(string $label, string $color = 'gray'): string {
    return "<span class=\"badge badge-{$color}\">{$label}</span>";
}

function icon(string $name, int $size = 16): string {
    return "<svg class=\"icon-{$name}\" width=\"{$size}\"></svg>";
}
