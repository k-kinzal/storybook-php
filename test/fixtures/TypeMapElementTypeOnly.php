<?php

namespace App\Components;

class ElementOnlyItem
{
    public function __construct(
        public string $label,
    ) {}
}

class ElementOnlyRenderer
{
    public function __construct(
        private $items,
    ) {}

    public function render(): string
    {
        $labels = array_map(
            static fn (ElementOnlyItem $item): string => $item->label,
            $this->items,
        );

        return '<ul><li>' . implode('</li><li>', $labels) . '</li></ul>';
    }
}
