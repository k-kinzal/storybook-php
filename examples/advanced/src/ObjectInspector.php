<?php
namespace App\Components;

/**
 * Demonstrates `object` and `iterable` type parameters.
 * The `object` type accepts any object; `iterable` accepts arrays or Traversables.
 */
class ObjectInspector {
    public function __construct(
        private string $title = 'Inspector',
    ) {}

    public function renderObject(object $data, string $variant = 'default'): string {
        $props = get_object_vars($data);
        $items = '';
        foreach ($props as $k => $v) {
            $items .= "<tr><td style=\"padding: 4px 12px; font-weight: 600;\">{$k}</td><td style=\"padding: 4px 12px;\">{$v}</td></tr>";
        }
        $bg = $variant === 'dark' ? '#1f2937' : '#f9fafb';
        $text = $variant === 'dark' ? '#f3f4f6' : '#111827';
        return "<div class=\"object-inspector\" style=\"background:{$bg}; color:{$text}; border-radius: 8px; padding: 16px; font-family: monospace;\"><h4 style=\"margin: 0 0 8px;\">{$this->title}</h4><table>{$items}</table></div>";
    }

    public function renderIterable(iterable $items, string $separator = ' | '): string {
        $parts = [];
        foreach ($items as $item) {
            $parts[] = "<span style=\"padding: 2px 8px; background: #e0e7ff; border-radius: 4px; font-size: 13px;\">{$item}</span>";
        }
        return "<div class=\"iterable-list\" style=\"font-family: system-ui;\">" . implode($separator, $parts) . "</div>";
    }
}
