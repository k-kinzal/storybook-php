<?php
namespace App\Components;

/**
 * Demonstrates object-typed parameters with `new ClassName()` default expressions.
 * PHP 8.1+ allows `new` in default parameter values.
 */
class CardStyle {
    public function __construct(
        public readonly string $borderColor = '#d1d5db',
        public readonly string $bgColor = '#ffffff',
        public readonly int $padding = 16,
        public readonly int $radius = 8,
    ) {}
}

class StyledCard {
    public function __construct(
        private string $title,
        private string $body = '',
        private CardStyle $style = new CardStyle(),
    ) {}

    public function render(): string {
        $bodyHtml = $this->body !== '' ? "<p style=\"margin: 8px 0 0; color: #4b5563;\">{$this->body}</p>" : '';
        return <<<HTML
        <div class="styled-card" style="background: {$this->style->bgColor}; border: 2px solid {$this->style->borderColor}; border-radius: {$this->style->radius}px; padding: {$this->style->padding}px;">
            <h3 style="margin: 0; color: #111827;">{$this->title}</h3>
            {$bodyHtml}
        </div>
        HTML;
    }
}
