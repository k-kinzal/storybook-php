<?php
namespace App\Components;

/**
 * Demonstrates a class with multiple named render methods.
 * Each method can be imported separately as a different story.
 */
class SplitView {
    public function __construct(
        private string $title,
        private string $description = '',
        private string $imageUrl = '',
        private string $theme = 'light',
    ) {}

    public function renderFull(): string {
        $style = $this->themeStyle();
        $imgHtml = $this->imageUrl !== ''
            ? "<div style=\"width: 100%; height: 160px; background: #e5e7eb; border-radius: 8px 8px 0 0; overflow: hidden;\"><img src=\"{$this->imageUrl}\" alt=\"\" style=\"width: 100%; height: 100%; object-fit: cover;\"></div>"
            : "<div style=\"width: 100%; height: 160px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;\"></div>";
        $descHtml = $this->description !== ''
            ? "<p style=\"margin: 8px 0 0; font-size: 14px; color: inherit; opacity: 0.7;\">{$this->description}</p>"
            : '';
        return "<div class=\"split-full\" style=\"{$style} border-radius: 8px; max-width: 320px; overflow: hidden;\">{$imgHtml}<div style=\"padding: 16px;\"><h3 style=\"margin: 0;\">{$this->title}</h3>{$descHtml}</div></div>";
    }

    public function renderCompact(): string {
        $style = $this->themeStyle();
        $descHtml = $this->description !== ''
            ? "<span style=\"margin-left: 8px; font-size: 13px; opacity: 0.6;\">{$this->description}</span>"
            : '';
        return "<div class=\"split-compact\" style=\"{$style} display: flex; align-items: center; padding: 10px 14px; border-radius: 6px;\"><strong>{$this->title}</strong>{$descHtml}</div>";
    }

    private function themeStyle(): string {
        return match ($this->theme) {
            'dark' => 'background: #1f2937; color: #f9fafb; border: 1px solid #374151; font-family: system-ui;',
            default => 'background: #ffffff; color: #111827; border: 1px solid #e5e7eb; font-family: system-ui;',
        };
    }
}
