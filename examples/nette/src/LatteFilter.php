<?php

namespace App\Components;

class LatteFilter
{
    public function __construct(
        public string $name = 'John Doe',
        public string $bio = 'A <strong>passionate</strong> developer.',
        public string $website = 'https://example.com',
        public string $role = 'admin',
    ) {}

    public function render(): string
    {
        // Add a custom filter to demonstrate Latte's filter system
        $GLOBALS['__storybook_latte']->addFilter('initials', function (string $name): string {
            return implode('', array_map(fn($w) => mb_strtoupper(mb_substr($w, 0, 1)), explode(' ', $name)));
        });

        return $GLOBALS['__storybook_latte']->renderToString(
            $GLOBALS['__storybook_latte_template_path'] . 'filter-demo.latte',
            [
                'name' => $this->name,
                'bio' => $this->bio,
                'website' => $this->website,
                'role' => $this->role,
            ]
        );
    }
}
