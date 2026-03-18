<?php
namespace App\Components;

use Attribute;

/**
 * Demonstrates PHP 8 attributes on constructor params and methods.
 * The parser strips #[...] attributes before extracting metadata,
 * ensuring they don't interfere with parameter/method parsing.
 */
#[Attribute]
class CardStyle {
    public function __construct(public string $theme = 'default') {}
}

class AttributeCard {
    public function __construct(
        #[CardStyle(theme: 'modern')]
        private string $title,
        #[CardStyle(theme: 'modern')]
        private string $body = '',
        private string $variant = 'default',
        private bool $elevated = false,
    ) {}

    #[Override]
    public function render(): string {
        $shadows = [
            'default' => 'none',
            'primary' => '0 2px 8px rgba(59,130,246,0.15)',
            'success' => '0 2px 8px rgba(34,197,94,0.15)',
        ];
        $borders = [
            'default' => '#e5e7eb',
            'primary' => '#3b82f6',
            'success' => '#22c55e',
        ];
        $shadow = $this->elevated ? '0 4px 16px rgba(0,0,0,0.1)' : ($shadows[$this->variant] ?? 'none');
        $border = $borders[$this->variant] ?? '#e5e7eb';
        $bodyHtml = $this->body !== '' ? "<p style=\"color: #6b7280; margin: 0; font-size: 14px;\">{$this->body}</p>" : '';

        return <<<HTML
        <div class="attr-card attr-card-{$this->variant}" style="
            padding: 16px 20px; border: 1px solid {$border}; border-radius: 10px;
            box-shadow: {$shadow}; font-family: system-ui, sans-serif;
        ">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #111827;">{$this->title}</h3>
            {$bodyHtml}
        </div>
        HTML;
    }
}
