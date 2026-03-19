<?php

namespace App\Components;

class CakeCard
{
    public function __construct(
        public string $title,
        public string $body,
        public ?string $image = null,
        public ?string $footer = null,
        public bool $featured = false,
    ) {}

    public function render(): string
    {
        $title = $this->title;
        $body = $this->body;
        $image = $this->image;
        $footer = $this->footer;
        $featured = $this->featured;

        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'card.php';
        return ob_get_clean();
    }
}
