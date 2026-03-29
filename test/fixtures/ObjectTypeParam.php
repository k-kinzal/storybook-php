<?php
namespace App\Components;

/**
 * Demonstrates the `object` type parameter and `iterable` type parameter.
 */
class ObjectTypeParam {
    public function __construct(
        private string $title,
    ) {}

    public function renderObject(object $data, string $class = 'card'): string {
        $props = get_object_vars($data);
        $items = '';
        foreach ($props as $k => $v) {
            $items .= "<li><strong>{$k}:</strong> {$v}</li>";
        }
        return "<div class=\"{$class}\"><h3>{$this->title}</h3><ul>{$items}</ul></div>";
    }

    public function renderIterable(iterable $items, string $separator = ', '): string {
        $parts = [];
        foreach ($items as $item) {
            $parts[] = (string) $item;
        }
        return "<div class=\"iterable-list\">{$this->title}: " . implode($separator, $parts) . "</div>";
    }
}
