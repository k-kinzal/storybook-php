<?php
namespace App\Components;

/**
 * Demonstrates PHPDoc generic type annotations: @param list<string>.
 * The runner+parser resolve list<T> to typed arrays.
 */
class PhpDocGenericList {
    /** @var list<string> */
    private array $items;

    /**
     * @param list<string> $items
     */
    public function __construct(
        array $items,
        private string $title = 'List',
    ) {
        $this->items = $items;
    }

    public function render(): string {
        if (empty($this->items)) {
            return "<div class=\"generic-list\"><h3>{$this->title}</h3><p>No items</p></div>";
        }
        $lis = implode('', array_map(
            fn(string $item) => "<li style=\"padding: 4px 0;\">{$item}</li>",
            $this->items,
        ));
        return <<<HTML
        <div class="generic-list" style="font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0;">{$this->title}</h3>
            <ul style="margin: 0; padding-left: 20px;">{$lis}</ul>
        </div>
        HTML;
    }
}
