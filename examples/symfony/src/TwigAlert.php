<?php

namespace App\Components;

class TwigAlert
{
    public function __construct(
        public string $title,
        public string $type = 'info',
        public ?string $message = null,
        public bool $dismissible = false,
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_twig']->render('alert.html.twig', [
            'title' => $this->title,
            'type' => $this->type,
            'message' => $this->message,
            'dismissible' => $this->dismissible,
        ]);
    }
}
