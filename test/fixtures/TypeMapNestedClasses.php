<?php

namespace App\Components;

class NestedMenuItem
{
    public function __construct(
        private string $label,
        private string $href = '#',
    ) {}

    public function render(): string
    {
        return "<li><a href=\"{$this->href}\">{$this->label}</a></li>";
    }
}

class NestedMenuSection
{
    public function __construct(
        private string $title,
        private array $items,
    ) {}

    public function render(): string
    {
        $items = implode('', array_map(
            fn($item) => $item instanceof NestedMenuItem ? $item->render() : '<li>raw</li>',
            $this->items,
        ));

        return "<section><h2>{$this->title}</h2><ul>{$items}</ul></section>";
    }
}

class NestedMenu
{
    public function __construct(private array $sections) {}

    public function render(): string
    {
        return '<nav>' . implode('', array_map(
            fn($section) => $section instanceof NestedMenuSection ? $section->render() : '<section>raw</section>',
            $this->sections,
        )) . '</nav>';
    }
}
