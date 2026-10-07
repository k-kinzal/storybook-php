<?php

namespace App\Components;

/**
 * Nested component: `$links` is a plain `array`, so the runtime cannot tell
 * that it holds NavLink instances. typeMap.classes describes it instead.
 */
class NavSection
{
    public function __construct(
        private string $title,
        private array $links,
    ) {}

    public function render(): string
    {
        $links = implode('', array_map(fn(NavLink $link) => $link->render(), $this->links));

        return "<section><h4 style=\"margin: 0 0 6px; font-size: 12px; text-transform: uppercase; color: #6b7280;\">{$this->title}</h4><ul style=\"margin: 0 0 12px; padding-left: 16px;\">{$links}</ul></section>";
    }
}
