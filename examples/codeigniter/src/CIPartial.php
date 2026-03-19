<?php

namespace App\Components;

class CIPartial
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
        include $GLOBALS['__storybook_ci4_template_path'] . 'partial_demo.php';
        return ob_get_clean();
    }
}
