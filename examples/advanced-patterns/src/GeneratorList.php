<?php
namespace App\Components;

/**
 * Demonstrates Generator return type. The render method uses yield
 * to produce HTML fragments, which the runner implodes into a single string.
 */
class GeneratorList {
    public function __construct(
        private string $title = 'Items',
        private int $count = 3,
        private string $variant = 'bullet',
    ) {}

    /** @return \Generator<int, string> */
    public function render(): \Generator {
        $tag = $this->variant === 'ordered' ? 'ol' : 'ul';
        $listStyle = match ($this->variant) {
            'ordered' => 'list-style: decimal;',
            'none' => 'list-style: none; padding-left: 0;',
            default => 'list-style: disc;',
        };

        yield "<div class=\"generator-list\" style=\"font-family: system-ui;\">";
        yield "<h3 style=\"margin: 0 0 8px 0;\">{$this->title}</h3>";
        yield "<{$tag} style=\"margin: 0; padding-left: 20px; {$listStyle}\">";

        for ($i = 1; $i <= $this->count; $i++) {
            yield "<li style=\"padding: 4px 0;\">Item {$i}</li>";
        }

        yield "</{$tag}>";
        yield "</div>";
    }
}
