<?php
namespace App\Helpers;

function generateList(string $title = 'Items', int $count = 3, string $marker = 'disc'): \Generator {
    yield "<h4>{$title}</h4>";
    yield '<ul>';
    for ($i = 1; $i <= $count; $i++) {
        yield "<li>Item {$i}</li>";
    }
    yield '</ul>';
}

function generateTable(int $rows = 3, int $cols = 3): \Generator {
    yield '<table>';
    for ($r = 1; $r <= $rows; $r++) {
        yield '<tr>';
        for ($c = 1; $c <= $cols; $c++) {
            yield "<td>R{$r}C{$c}</td>";
        }
        yield '</tr>';
    }
    yield '</table>';
}
