<?php

namespace App\Components;

class CakeAlert
{
    public function __construct(
        public string $title,
        public string $type = 'info',
        public ?string $message = null,
        public bool $dismissible = false,
    ) {}

    public function render(): string
    {
        $title = $this->title;
        $type = $this->type;
        $message = $this->message;
        $dismissible = $this->dismissible;

        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'alert.php';
        return ob_get_clean();
    }
}
