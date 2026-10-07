<?php

namespace App\Components;

/**
 * Deeply nested untyped arrays: NavMenu → NavSection[] → NavLink[].
 * Neither level declares its element type, so typeMap.classes supplies both.
 */
class NavMenu
{
    public function __construct(private array $sections) {}

    public function render(): string
    {
        $sections = implode('', array_map(fn(NavSection $section) => $section->render(), $this->sections));

        return "<nav style=\"font-family: system-ui; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; max-width: 280px;\">{$sections}</nav>";
    }
}
