<?php
namespace App\Components;

/**
 * Demonstrates list<T> auto-casting: plain associative arrays from Storybook
 * are automatically instantiated as typed class objects by the runner.
 */
readonly class ArrayOfObjectsItem {
    public function __construct(
        public string $label,
        public int $value = 0,
    ) {}
}

class ArrayOfObjects {
    /** @var list<ArrayOfObjectsItem> */
    private array $items;

    /**
     * @phpstan-param list<ArrayOfObjectsItem> $items
     */
    public function __construct(
        array $items,
    ) {
        $this->items = $items;
    }

    public function render(): string {
        if (empty($this->items)) {
            return '<div class="array-objects"><p>No items</p></div>';
        }
        $rows = implode('', array_map(
            fn(ArrayOfObjectsItem $item) =>
                "<li style=\"padding: 4px 0;\">{$item->label}: <strong>{$item->value}</strong></li>",
            $this->items,
        ));
        return <<<HTML
        <div class="array-objects" style="font-family: system-ui;">
            <ul style="margin: 0; padding-left: 20px;">{$rows}</ul>
        </div>
        HTML;
    }
}
