<?php

namespace App\Components;

class TwigCard
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
        return $GLOBALS['__storybook_twig']->render('card.html.twig', [
            'title' => $this->title,
            'body' => $this->body,
            'image' => $this->image,
            'footer' => $this->footer,
            'featured' => $this->featured,
        ]);
    }
}
