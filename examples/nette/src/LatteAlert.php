<?php

namespace App\Components;

class LatteAlert
{
    public function __construct(
        public string $title,
        public string $type = 'info',
        public ?string $message = null,
        public bool $dismissible = false,
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'alert.latte',
            [
                'title' => $this->title,
                'type' => $this->type,
                'message' => $this->message,
                'dismissible' => $this->dismissible,
            ]
        );
    }
}
