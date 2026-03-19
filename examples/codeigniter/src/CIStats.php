<?php

namespace App\Components;

class CIStats
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
        $items = $this->items;
        $color = $this->color;

        ob_start();
        include $GLOBALS['__storybook_ci4_template_path'] . 'stats.php';
        return ob_get_clean();
    }
}
