<?php
namespace App\Components;

/**
 * Demonstrates class inheritance with method overriding.
 * BaseCard defines the structure; FeatureCard extends it with extra features.
 */
class BaseCard {
    public function __construct(
        protected string $title,
        protected string $body = '',
    ) {}

    public function render(): string {
        $bodyHtml = $this->body !== ''
            ? "<p style=\"margin: 8px 0 0; color: #4b5563;\">{$this->body}</p>"
            : '';
        return "<div class=\"base-card\" style=\"padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\"><h3 style=\"margin: 0;\">{$this->title}</h3>{$bodyHtml}</div>";
    }
}

class FeatureCard extends BaseCard {
    public function __construct(
        string $title,
        string $body = '',
        private string $icon = '⭐',
        private string $accentColor = '#3b82f6',
    ) {
        parent::__construct($title, $body);
    }

    public function render(): string {
        $bodyHtml = $this->body !== ''
            ? "<p style=\"margin: 8px 0 0; color: #4b5563;\">{$this->body}</p>"
            : '';
        return <<<HTML
        <div class="feature-card" style="padding: 16px; border: 1px solid #e5e7eb; border-left: 4px solid {$this->accentColor}; border-radius: 8px; font-family: system-ui;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 24px;">{$this->icon}</span>
                <h3 style="margin: 0;">{$this->title}</h3>
            </div>
            {$bodyHtml}
        </div>
        HTML;
    }
}
