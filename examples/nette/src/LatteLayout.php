<?php

namespace App\Components;

class LatteLayout
{
    public function __construct(
        public string $title = 'My Page',
        public string $content = 'Welcome to the page.',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'page.latte',
            [
                'title' => $this->title,
                'content' => $this->content,
            ]
        );
    }
}
