<?php
namespace App\Helpers;

/**
 * Demonstrates standalone function with complex array default values.
 */
function complexList(
    array $items = ['Item 1', 'Item 2', 'Item 3'],
    string $style = 'disc',
    bool $compact = false,
): string {
    $padding = $compact ? '2px 0' : '6px 0';
    $listStyle = htmlspecialchars($style);
    $html = "<ul class=\"complex-list\" style=\"list-style-type: {$listStyle}; padding-left: 20px;\">";
    foreach ($items as $item) {
        $escaped = htmlspecialchars((string) $item);
        $html .= "<li style=\"padding: {$padding};\">{$escaped}</li>";
    }
    $html .= '</ul>';
    return $html;
}
