<?php

namespace App\Components;

class LattePartial
{
    public function __construct(
        public string $name = 'Feature',
        public string $status = 'active',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'partial-demo.latte',
            [
                'name' => $this->name,
                'status' => $this->status,
            ]
        );
    }
}
