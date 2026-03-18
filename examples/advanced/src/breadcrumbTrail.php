<?php
namespace App\Helpers;

/**
 * Standalone function with variadic parameter.
 * The runner expands an array argument into variadic segments.
 */
function breadcrumbTrail(string $separator = ' / ', string ...$segments): string {
    if (empty($segments)) {
        return '<nav class="breadcrumb" style="font-family: system-ui; color: #9ca3af;">No path</nav>';
    }

    $parts = [];
    $count = count($segments);
    foreach ($segments as $i => $segment) {
        $isLast = $i === $count - 1;
        $style = $isLast
            ? 'color: #111827; font-weight: 600;'
            : 'color: #6b7280; text-decoration: underline; cursor: pointer;';
        $parts[] = "<span style=\"{$style}\">" . htmlspecialchars($segment) . "</span>";
    }

    $sep = "<span style=\"color: #d1d5db; margin: 0 4px;\">" . htmlspecialchars($separator) . "</span>";
    $trail = implode($sep, $parts);

    return "<nav class=\"breadcrumb\" style=\"font-family: system-ui; font-size: 14px; padding: 8px 0;\">{$trail}</nav>";
}
