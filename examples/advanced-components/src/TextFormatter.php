<?php

/**
 * Multiple standalone functions without namespace.
 * Demonstrates global functions with various param types.
 */

function truncate(string $text, int $length = 50, string $suffix = '...'): string
{
    if (mb_strlen($text) <= $length) {
        return "<span class=\"truncated truncated-full\">{$text}</span>";
    }
    $cut = mb_substr($text, 0, $length);
    return "<span class=\"truncated truncated-cut\">{$cut}{$suffix}</span>";
}

function highlight(string $text, string $term, string $color = '#fef08a'): string
{
    if ($term === '') {
        return "<span class=\"highlight\">{$text}</span>";
    }
    $escaped = preg_quote($term, '/');
    $result = preg_replace(
        "/({$escaped})/i",
        "<mark class=\"highlight-mark\" style=\"background: {$color};\">$1</mark>",
        htmlspecialchars($text)
    );
    return "<span class=\"highlight\">{$result}</span>";
}

function slugify(string $text, string $separator = '-'): string
{
    $slug = strtolower(trim($text));
    $slug = preg_replace('/[^a-z0-9]+/', $separator, $slug);
    $slug = trim($slug, $separator);
    return "<code class=\"slug\" style=\"font-family: system-ui;\">{$slug}</code>";
}
