<?php
/**
 * Demonstrates global (no-namespace) standalone functions.
 * These functions live in the global namespace.
 */

function highlight(string $text, string $color = '#fef08a'): string {
    return "<mark style=\"background: {$color}; padding: 2px 4px; border-radius: 2px;\">{$text}</mark>";
}

function truncate(string $text, int $length = 50, string $suffix = '...'): string {
    $truncated = mb_strlen($text) > $length
        ? mb_substr($text, 0, $length) . $suffix
        : $text;
    return "<span class=\"truncated\" style=\"font-size: 14px; color: #374151;\">{$truncated}</span>";
}
