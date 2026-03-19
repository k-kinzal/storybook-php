<?php

namespace App\Components;

class CILayout
{
    public function __construct(
        public string $title = 'My Page',
        public string $content = 'Welcome to the page.',
    ) {}

    public function render(): string
    {
        $title = $this->title;
        $content = $this->content;

        // Render the page content
        ob_start();
        include $GLOBALS['__storybook_ci4_template_path'] . 'page.php';
        $pageContent = ob_get_clean();

        // Wrap in the layout
        $contentForLayout = $pageContent;
        ob_start();
        include $GLOBALS['__storybook_ci4_template_path'] . 'layouts/default.php';
        return ob_get_clean();
    }
}
