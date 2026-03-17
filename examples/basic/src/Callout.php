<?php
namespace App\Components;

/**
 * Demonstrates a component with many boolean flags
 * controlling conditional rendering of various UI elements.
 */
class Callout {
    public function __construct(
        private string $title,
        private string $message,
        private string $type = 'info',
        private bool $showIcon = true,
        private bool $bordered = true,
        private bool $rounded = true,
        private bool $shadow = false,
        private bool $closable = false,
        private bool $compact = false,
    ) {}

    public function render(): string
    {
        $palettes = [
            'info'    => ['bg' => '#eff6ff', 'border' => '#3b82f6', 'text' => '#1e40af', 'icon' => '&#x2139;&#xFE0E;'],
            'success' => ['bg' => '#f0fdf4', 'border' => '#22c55e', 'text' => '#166534', 'icon' => '&#x2713;'],
            'warning' => ['bg' => '#fffbeb', 'border' => '#f59e0b', 'text' => '#92400e', 'icon' => '&#x26A0;&#xFE0E;'],
            'error'   => ['bg' => '#fef2f2', 'border' => '#ef4444', 'text' => '#991b1b', 'icon' => '&#x2717;'],
            'neutral' => ['bg' => '#f9fafb', 'border' => '#d1d5db', 'text' => '#374151', 'icon' => '&#x2022;'],
        ];

        $p = $palettes[$this->type] ?? $palettes['info'];
        $padding = $this->compact ? '8px 12px' : '14px 18px';
        $borderStyle = $this->bordered ? "border: 1px solid {$p['border']};" : '';
        $borderLeft = "border-left: 4px solid {$p['border']};";
        $radius = $this->rounded ? 'border-radius: 8px;' : '';
        $shadowStyle = $this->shadow ? 'box-shadow: 0 1px 3px rgba(0,0,0,0.1);' : '';
        $titleSize = $this->compact ? '13px' : '15px';
        $msgSize = $this->compact ? '12px' : '14px';

        $iconHtml = $this->showIcon
            ? "<span style=\"font-size: 18px; margin-right: 10px;\">{$p['icon']}</span>"
            : '';

        $closeHtml = $this->closable
            ? '<button style="margin-left: auto; background: none; border: none; font-size: 16px; cursor: pointer; opacity: 0.5;">&times;</button>'
            : '';

        return <<<HTML
        <div class="callout callout-{$this->type}" style="display: flex; align-items: flex-start; {$borderStyle} {$borderLeft} {$radius} {$shadowStyle} background: {$p['bg']}; color: {$p['text']}; padding: {$padding}; font-family: system-ui;">
            {$iconHtml}
            <div style="flex: 1;">
                <div style="font-weight: 600; font-size: {$titleSize}; margin-bottom: 2px;">{$this->title}</div>
                <div style="font-size: {$msgSize}; opacity: 0.85;">{$this->message}</div>
            </div>
            {$closeHtml}
        </div>
        HTML;
    }
}
