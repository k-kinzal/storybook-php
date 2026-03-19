<?php

namespace App\Components;

class TwigMacro
{
    public function __construct(
        public string $username = 'johndoe',
        public string $role = 'Admin',
        public string $joinedAt = '2024-01-15',
    ) {}

    public function render(): string
    {
        return $GLOBALS['__storybook_twig']->render('macro-demo.html.twig', [
            'username' => $this->username,
            'role' => $this->role,
            'joinedAt' => $this->joinedAt,
        ]);
    }
}
