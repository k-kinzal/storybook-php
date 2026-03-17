<?php
namespace App\Components;

function definitionList(array $items, string $variant = 'default'): \Generator {
    yield '<dl>';
    foreach ($items as $term => $desc) {
        yield "<dt>{$term}</dt><dd>{$desc}</dd>";
    }
    yield '</dl>';
}
