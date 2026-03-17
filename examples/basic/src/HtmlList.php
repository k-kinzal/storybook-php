<?php
namespace App\Components;

class HtmlList {
    public function __construct(
        private array $items,
        private bool $ordered = false,
    ) {}

    public function render(): \Generator {
        $tag = $this->ordered ? 'ol' : 'ul';
        yield "<{$tag} class=\"html-list\" style=\"padding-left: 20px;\">";
        foreach ($this->items as $item) {
            yield "<li style=\"margin: 4px 0;\">" . htmlspecialchars((string) $item) . "</li>";
        }
        yield "</{$tag}>";
    }
}
