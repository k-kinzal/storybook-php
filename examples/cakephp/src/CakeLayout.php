<?php

namespace App\Components;

class CakeLayout
{
    public function __construct(
        public string $title = 'My Page',
        public string $content = 'Welcome to the page.',
    ) {}

    public function render(): string
    {
        $title = $this->title;
        $content = $this->content;

        // Render the page content first
        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'layout_page.php';
        $pageContent = ob_get_clean();

        // Then wrap in the layout
        $contentForLayout = $pageContent;
        ob_start();
        include $GLOBALS['__storybook_cake_template_path'] . 'layout/default.php';
        return ob_get_clean();
    }
}
