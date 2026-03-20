<?php
namespace App\Components;

/**
 * Demonstrates constructor parameters with object defaults using new expressions.
 * PHP 8.1+ allows `new ClassName()` as default parameter values.
 */
class ThemeConfig {
    public function __construct(
        public readonly string $primaryColor = '#3b82f6',
        public readonly string $fontFamily = 'system-ui, sans-serif',
        public readonly int $borderRadius = 8,
    ) {}
}

class ObjectConfig {
    public function __construct(
        private string $title,
        private string $description = '',
        private ThemeConfig $theme = new ThemeConfig(),
    ) {}

    public function render(): string {
        return "<div class=\"config-card\" style=\"font-family: {$this->theme->fontFamily}; padding: 20px; border: 2px solid {$this->theme->primaryColor}; border-radius: {$this->theme->borderRadius}px;\">
            <h3 style=\"margin: 0 0 8px 0; color: {$this->theme->primaryColor};\">{$this->title}</h3>
            <p style=\"margin: 0; color: #6b7280; font-size: 14px;\">{$this->description}</p>
        </div>";
    }
}
