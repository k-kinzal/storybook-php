<?php
namespace App\Components;

/**
 * Demonstrates Generator return. The render method uses yield
 * to produce HTML fragments, which the runner collects via
 * iterator_to_array() and implodes into a single string.
 */
class Checklist {
    /** @var string[] */
    private array $items;

    public function __construct(
        private string $title = 'Checklist',
        string ...$items,
    ) {
        $this->items = $items;
    }

    /** @return \Generator<int, string> */
    public function render(bool $numbered = false): \Generator {
        yield "<div class=\"checklist\" style=\"border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; max-width: 320px;\">";
        yield "<h3 style=\"margin: 0 0 8px 0;\">{$this->title}</h3>";

        if (empty($this->items)) {
            yield "<p style=\"color: #9ca3af; font-style: italic;\">No items</p>";
        } else {
            $tag = $numbered ? 'ol' : 'ul';
            yield "<{$tag} style=\"margin: 0; padding-left: 20px;\">";
            foreach ($this->items as $item) {
                yield "<li style=\"padding: 2px 0;\">{$item}</li>";
            }
            yield "</{$tag}>";
        }

        yield "</div>";
    }
}
