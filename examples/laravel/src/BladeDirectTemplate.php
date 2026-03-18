<?php
// This file serves as a marker for storybook-php.
// The actual rendering is done by the Blade template directly.
// See BladeDirectTemplate.blade.php

namespace App\View;

class BladeDirectTemplate
{
    public function __construct(
        public string $title = 'Welcome',
        public string $message = 'Hello from Blade!',
    ) {}

    public function render(): string
    {
        $factory = app('view');
        return $factory->make('direct-template', [
            'title' => $this->title,
            'message' => $this->message,
        ])->render();
    }
}
