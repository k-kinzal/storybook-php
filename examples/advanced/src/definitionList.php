<?php
namespace App\Components;

/**
 * Demonstrates a standalone generator function.
 * The runner collects Generator output via implode(iterator_to_array()).
 */
function definitionList(array $items, string $variant = 'default'): \Generator {
    $border = match ($variant) {
        'striped' => true,
        'compact' => false,
        default   => false,
    };
    $padding = $variant === 'compact' ? '4px 0' : '8px 0';

    yield '<dl style="font-family: system-ui; margin: 0; max-width: 400px;">';
    $i = 0;
    foreach ($items as $term => $desc) {
        $bg = $border && $i % 2 === 0 ? 'background: #f9fafb;' : '';
        yield "<div style=\"display: flex; justify-content: space-between; padding: {$padding}; {$bg}\">";
        yield "<dt style=\"font-weight: 600; color: #374151; font-size: 14px;\">{$term}</dt>";
        yield "<dd style=\"margin: 0; color: #6b7280; font-size: 14px;\">{$desc}</dd>";
        yield '</div>';
        $i++;
    }
    yield '</dl>';
}
