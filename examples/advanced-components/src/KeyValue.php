<?php

/**
 * Demonstrates a global function with array parameter
 * that renders key-value pairs as a definition list.
 */
function keyValueList(array $items, bool $horizontal = false, string $emptyMessage = 'No data'): string {
    if (empty($items)) {
        return "<div class=\"kv-list kv-empty\">{$emptyMessage}</div>";
    }

    $style = $horizontal
        ? 'display: flex; flex-wrap: wrap; gap: 16px;'
        : '';

    $html = "<dl class=\"kv-list\" style=\"{$style}\">";
    foreach ($items as $key => $value) {
        $html .= "<div class=\"kv-item\" style=\"margin-bottom: 8px;\">";
        $html .= "<dt style=\"font-weight: bold; color: #374151;\">" . htmlspecialchars((string) $key) . "</dt>";
        $html .= "<dd style=\"margin: 0; color: #6b7280;\">" . htmlspecialchars((string) $value) . "</dd>";
        $html .= "</div>";
    }
    $html .= "</dl>";
    return $html;
}
