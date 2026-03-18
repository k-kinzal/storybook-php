<?php

namespace App\Components;

class DeprecatedAttr
{
    public function __construct(
        private string $name = 'World',
        private string $style = 'modern',
    ) {}

    #[\Deprecated(message: 'Use renderModern() instead', since: '2.0')]
    public function renderLegacy(): string
    {
        return "<p class=\"legacy\">Hello, {$this->name}!</p>";
    }

    public function renderModern(): string
    {
        return <<<HTML
        <div class="modern-greeting" style="padding: 12px; border-radius: 8px;">
            <h3>Hello, {$this->name}!</h3>
            <span class="style-badge">{$this->style}</span>
        </div>
        HTML;
    }
}
