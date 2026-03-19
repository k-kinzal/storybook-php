<?php

namespace App\Components;

class TwigLayout
{
    public function __construct(
        public string $title = 'My Page',
        public string $content = 'Welcome to the page.',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_twig']->render('page.html.twig', [
            'title' => $this->title,
            'content' => $this->content,
        ]);
    }
}
