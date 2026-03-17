<?php
namespace App\Helpers;

/**
 * Demonstrates deeply nested array default values in function parameters.
 */
function renderGrid(
    string $title = 'Grid',
    array $rows = [['A1', 'A2', 'A3'], ['B1', 'B2', 'B3']],
    array $config = ['border' => true, 'colors' => ['header' => '#1f2937', 'cell' => '#6b7280']],
): string {
    $border = ($config['border'] ?? true) ? '1px solid #e5e7eb' : 'none';
    $headerColor = $config['colors']['header'] ?? '#1f2937';
    $cellColor = $config['colors']['cell'] ?? '#6b7280';
    $html = "<table class=\"nested-grid\" style=\"border-collapse: collapse; font-family: system-ui;\">";
    $html .= "<caption style=\"color: {$headerColor}; font-weight: bold; margin-bottom: 8px; font-size: 16px;\">{$title}</caption>";
    foreach ($rows as $ri => $row) {
        $html .= '<tr>';
        foreach ($row as $cell) {
            $bg = $ri === 0 ? '#f3f4f6' : 'white';
            $html .= "<td style=\"border: {$border}; padding: 8px 14px; color: {$cellColor}; background: {$bg};\">{$cell}</td>";
        }
        $html .= '</tr>';
    }
    $html .= '</table>';
    return $html;
}

function renderMatrix(
    array $matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    string $label = 'Identity Matrix',
): string {
    $html = "<div class=\"matrix\" style=\"font-family: monospace;\">";
    $html .= "<strong style=\"display: block; margin-bottom: 8px;\">{$label}</strong>";
    $html .= "<table style=\"border-collapse: collapse;\">";
    foreach ($matrix as $row) {
        $html .= '<tr>';
        foreach ($row as $val) {
            $bg = $val !== 0 ? '#dbeafe' : 'transparent';
            $html .= "<td style=\"padding: 6px 12px; text-align: center; border: 1px solid #e5e7eb; background: {$bg};\">{$val}</td>";
        }
        $html .= '</tr>';
    }
    $html .= '</table></div>';
    return $html;
}
