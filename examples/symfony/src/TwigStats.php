<?php

namespace App\Components;

class TwigStats
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
        return $GLOBALS['__storybook_twig']->render('stats.html.twig', [
            'items' => $this->items,
            'color' => $this->color,
        ]);
    }
}
