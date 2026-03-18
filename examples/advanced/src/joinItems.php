<?php
namespace App\Helpers;

/**
 * Demonstrates standalone functions with variadic parameters.
 * The runner spreads array args into variadic parameters.
 */
function joinItems(string $separator, string ...$items): string {
    if (empty($items)) {
        return '<span class="join-empty" style="color: #9ca3af; font-style: italic;">No items</span>';
    }

    $escaped = array_map('htmlspecialchars', $items);
    $sepHtml = "<span style=\"color: #9ca3af; margin: 0 4px;\">" . htmlspecialchars($separator) . "</span>";
    return '<span class="join-items" style="font-family: system-ui;">' . implode($sepHtml, $escaped) . '</span>';
}

function wrapEach(string $tag, string $className = '', string ...$items): string {
    if (empty($items)) {
        return '<div class="wrap-empty" style="color: #9ca3af; font-style: italic;">No items</div>';
    }

    $cls = $className !== '' ? " class=\"{$className}\"" : '';
    $html = '';
    foreach ($items as $item) {
        $html .= "<{$tag}{$cls}>" . htmlspecialchars($item) . "</{$tag}>";
    }
    return "<div class=\"wrap-each\">{$html}</div>";
}
