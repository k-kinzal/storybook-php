<?php
namespace App\Helpers;

/**
 * Demonstrates deeply nested array default values in function parameters.
 */
function renderGrid(
    string $title = 'Grid',
    array $rows = [['A1', 'A2'], ['B1', 'B2']],
    array $config = ['border' => true, 'colors' => ['header' => '#333', 'cell' => '#666']],
): string {
    $border = ($config['border'] ?? true) ? '1px solid #e5e7eb' : 'none';
    $headerColor = $config['colors']['header'] ?? '#333';
    $cellColor = $config['colors']['cell'] ?? '#666';
    $html = "<table class=\"nested-grid\" style=\"border-collapse: collapse;\">";
    $html .= "<caption style=\"color: {$headerColor}; font-weight: bold; margin-bottom: 8px;\">{$title}</caption>";
    foreach ($rows as $row) {
        $html .= '<tr>';
        foreach ($row as $cell) {
            $html .= "<td style=\"border: {$border}; padding: 8px; color: {$cellColor};\">{$cell}</td>";
        }
        $html .= '</tr>';
    }
    $html .= '</table>';
    return $html;
}

function renderMatrix(
    array $matrix = [[1, 0], [0, 1]],
    string $label = 'Identity',
): string {
    $html = "<div class=\"matrix\"><strong>{$label}</strong><table>";
    foreach ($matrix as $row) {
        $html .= '<tr>';
        foreach ($row as $val) {
            $html .= "<td style=\"padding: 4px 8px; text-align: center;\">{$val}</td>";
        }
        $html .= '</tr>';
    }
    $html .= '</table></div>';
    return $html;
}
