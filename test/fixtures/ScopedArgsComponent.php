<?php

namespace App\Components;

class ScopedArgsComponent
{
    public function __construct(
        private string $title,
    ) {}

    public function render(string $title): string
    {
        return "<div data-constructor=\"{$this->title}\" data-method=\"{$title}\">{$this->title}|{$title}</div>";
    }
}
