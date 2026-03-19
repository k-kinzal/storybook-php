<?php

namespace App\Components;

class TwigPartial
{
    public function __construct(
        public string $name = 'Feature',
        public string $status = 'active',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_twig']->render('partial-demo.html.twig', [
            'name' => $this->name,
            'status' => $this->status,
        ]);
    }
}
