<?php
namespace App\Helpers;

/**
 * Demonstrates standalone generator functions.
 * The runner joins yielded strings into a single HTML string.
 */
function generateList(string $title = 'Items', int $count = 3, string $marker = 'disc'): \Generator {
    yield '<div class="gen-list" style="font-family: system-ui;">';
    yield "<h4 style=\"margin: 0 0 8px 0;\">{$title}</h4>";
    yield "<ul style=\"margin: 0; padding-left: 20px; list-style: {$marker};\">";
    for ($i = 1; $i <= $count; $i++) {
        yield "<li style=\"padding: 2px 0;\">Item {$i}</li>";
    }
    yield '</ul>';
    yield '</div>';
}

function generateTable(int $rows = 3, int $cols = 3): \Generator {
    yield '<table style="border-collapse: collapse; font-family: system-ui; font-size: 14px;">';
    yield '<thead><tr>';
    for ($c = 1; $c <= $cols; $c++) {
        yield "<th style=\"padding: 8px 16px; background: #f3f4f6; border: 1px solid #e5e7eb; font-weight: 600;\">Col {$c}</th>";
    }
    yield '</tr></thead>';
    yield '<tbody>';
    for ($r = 1; $r <= $rows; $r++) {
        yield '<tr>';
        for ($c = 1; $c <= $cols; $c++) {
            yield "<td style=\"padding: 8px 16px; border: 1px solid #e5e7eb;\">R{$r}C{$c}</td>";
        }
        yield '</tr>';
    }
    yield '</tbody></table>';
}
