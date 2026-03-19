<?php

namespace App\Components;

class LatteCard
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
        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'card.latte',
            [
                'title' => $this->title,
                'body' => $this->body,
                'image' => $this->image,
                'footer' => $this->footer,
                'featured' => $this->featured,
            ]
        );
    }
}
