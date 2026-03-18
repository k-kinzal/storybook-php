<?php

namespace App\Components;

class ClosureCapture
{
    public function __construct(
        private string $prefix = 'Item',
        private string $separator = ' | ',
    ) {}

    public function render(): string
    {
        $items = ['Alpha', 'Beta', 'Gamma'];

        $formatter = function (string $item) {
            return "<span class=\"item\">{$this->prefix}: {$item}</span>";
        };

        $parts = array_map($formatter, $items);

        return '<div class="closure-capture">' . implode($this->separator, $parts) . '</div>';
    }
}
