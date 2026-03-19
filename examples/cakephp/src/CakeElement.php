<?php

namespace App\Components;

class CakeElement
{
    public function __construct(
        public string $name = 'Feature',
        public string $status = 'active',
    ) {}

    public function render(): string
    {
        $name = $this->name;
        $status = $this->status;

        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'element_demo.php';
        return ob_get_clean();
    }
}
