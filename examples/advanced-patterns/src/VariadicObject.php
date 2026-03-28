<?php
namespace App\Components;

/**
 * Demonstrates typed object variadic parameters.
 * The runner auto-instantiates each array element as a MenuItem object.
 */
class MenuItem {
    public function __construct(
        public string $label,
        public string $url = '#',
    ) {}
}

class VariadicObject {
    /** @var MenuItem[] */
    private array $items;

    public function __construct(
        MenuItem ...$items,
    ) {
        $this->items = $items;
    }

    public function render(): string {
        if (empty($this->items)) {
            return '<nav class="variadic-menu" style="font-family: system-ui; color: #9ca3af;">No menu items</nav>';
        }
        $links = implode('', array_map(
            fn(MenuItem $item) =>
                "<a href=\"{$item->url}\" style=\"display: inline-block; padding: 6px 12px; color: #3b82f6; text-decoration: none;\">{$item->label}</a>",
            $this->items,
        ));
        return "<nav class=\"variadic-menu\" style=\"font-family: system-ui;\">{$links}</nav>";
    }
}
