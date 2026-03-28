<?php
namespace App\Components;

class Breadcrumb {
    public function __construct(private string $separator = ' / ') {}

    public function render(string ...$segments): string {
        if (count($segments) === 0) {
            return '<nav class="breadcrumb"><span class="breadcrumb-empty">No path</span></nav>';
        }
        $last = count($segments) - 1;
        $items = array_map(
            fn(string $s, int $i) => $i === $last
                ? "<span class=\"breadcrumb-item breadcrumb-current\">{$s}</span>"
                : "<span class=\"breadcrumb-item\">{$s}</span>",
            $segments,
            array_keys($segments)
        );
        return '<nav class="breadcrumb">' . implode(htmlspecialchars($this->separator), $items) . '</nav>';
    }
}
