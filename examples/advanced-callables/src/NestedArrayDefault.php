<?php
namespace App\Helpers;

/**
 * Demonstrates deeply nested array default values in function parameters.
 * The parser extracts complex nested defaults for Storybook controls.
 */
function renderNestedDefault(
    string $title = 'Grid',
    array $config = ['border' => true, 'colors' => ['header' => '#333', 'cell' => '#666']],
): string {
    $border = ($config['border'] ?? true) ? '1px solid #e5e7eb' : 'none';
    $headerColor = $config['colors']['header'] ?? '#333';
    $cellColor = $config['colors']['cell'] ?? '#666';
    return <<<HTML
    <div class="nested-default" style="font-family: system-ui;">
        <h3 style="color: {$headerColor}; margin: 0 0 8px 0;">{$title}</h3>
        <div style="border: {$border}; padding: 12px; color: {$cellColor}; border-radius: 6px;">
            Content with nested config
        </div>
    </div>
    HTML;
}
