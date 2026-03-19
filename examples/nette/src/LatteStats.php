<?php

namespace App\Components;

class LatteStats
{
    /**
     * @param array<int, array{label: string, value: string|int}> $items
     */
    public function __construct(
        public array $items,
        public string $color = '#3b82f6',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'stats.latte',
            [
                'items' => $this->items,
                'color' => $this->color,
            ]
        );
    }
}
