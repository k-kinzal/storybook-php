<?php
namespace App\Helpers;

function complexList(
    array $items = ['Item 1', 'Item 2', 'Item 3'],
    string $style = 'disc',
    bool $compact = false,
): string {
    $html = "<ul class=\"complex-list\" style=\"list-style-type: {$style};\">";
    foreach ($items as $item) {
        $html .= "<li>{$item}</li>";
    }
    $html .= '</ul>';
    return $html;
}
