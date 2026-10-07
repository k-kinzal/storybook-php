<?php

namespace App\Components;

class NavLink
{
    public function __construct(
        private string $label,
        private string $href = '#',
    ) {}

    public function render(): string
    {
        return "<li><a href=\"{$this->href}\" style=\"color: #2563eb; text-decoration: none;\">{$this->label}</a></li>";
    }
}
