<?php
namespace App\Components;

/**
 * Demonstrates heredoc syntax in PHP render methods.
 * Uses heredoc for multi-line HTML generation with variable interpolation.
 */
class HeredocCard {
    public function __construct(
        private string $title,
        private string $body = '',
        private string $theme = 'light',
        private ?string $imageUrl = null,
    ) {}

    public function render(): string {
        $bgColor = $this->theme === 'dark' ? '#1f2937' : '#ffffff';
        $textColor = $this->theme === 'dark' ? '#f9fafb' : '#111827';
        $borderColor = $this->theme === 'dark' ? '#374151' : '#e5e7eb';

        $imageBlock = '';
        if ($this->imageUrl !== null) {
            $imageBlock = <<<IMG
            <div style="margin: -16px -16px 16px -16px; border-radius: 12px 12px 0 0; overflow: hidden;">
                <img src="{$this->imageUrl}" alt="{$this->title}" style="width: 100%; height: 160px; object-fit: cover; display: block;">
            </div>
            IMG;
        }

        return <<<HTML
        <div class="heredoc-card" style="background: {$bgColor}; color: {$textColor}; border: 1px solid {$borderColor}; border-radius: 12px; padding: 16px; max-width: 320px; font-family: system-ui;">
            {$imageBlock}
            <h3 style="margin: 0 0 8px 0; font-size: 18px;">{$this->title}</h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; opacity: 0.8;">{$this->body}</p>
        </div>
        HTML;
    }
}
