<?php
namespace App\Components;

/**
 * Demonstrates self/static return types for fluent interfaces.
 * The parser resolves self/static keywords to the declaring class name.
 */
class SelfReturn {
    /** @var list<string> */
    private array $items;

    /** @param list<string> $items */
    public function __construct(
        array $items = [],
    ) {
        $this->items = $items;
    }

    public function add(string $item): self {
        $this->items[] = $item;
        return $this;
    }

    public function render(): string {
        if (empty($this->items)) {
            return '<div class="self-return" style="font-family: system-ui; color: #9ca3af;">No items added</div>';
        }
        $lis = implode('', array_map(
            fn(string $item) => "<li style=\"padding: 2px 0;\">{$item}</li>",
            $this->items,
        ));
        return "<div class=\"self-return\" style=\"font-family: system-ui;\"><ul style=\"margin: 0; padding-left: 20px;\">{$lis}</ul></div>";
    }
}
