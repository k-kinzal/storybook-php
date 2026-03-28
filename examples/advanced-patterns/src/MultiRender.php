<?php
namespace App\Components;

/**
 * Demonstrates a class with multiple renderable public methods.
 * Each method can be imported separately via @render, @renderCard, @renderRow.
 */
class MultiRender {
    public function __construct(
        private string $title,
        private string $description = '',
        private string $icon = '',
    ) {}

    public function render(): string {
        $iconHtml = $this->icon !== '' ? "<span style=\"font-size: 24px; margin-right: 8px;\">{$this->icon}</span>" : '';
        return <<<HTML
        <div class="multi-default" style="display: flex; align-items: center; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;">
            {$iconHtml}
            <div>
                <strong style="display: block; color: #111827;">{$this->title}</strong>
                <span style="font-size: 13px; color: #6b7280;">{$this->description}</span>
            </div>
        </div>
        HTML;
    }

    public function renderCard(string $footer = ''): string {
        $iconHtml = $this->icon !== '' ? "<div style=\"font-size: 32px; margin-bottom: 8px;\">{$this->icon}</div>" : '';
        $footerHtml = $footer !== '' ? "<div style=\"margin-top: 12px; padding-top: 8px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;\">{$footer}</div>" : '';
        return <<<HTML
        <div class="multi-card" style="padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 280px; font-family: system-ui; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            {$iconHtml}
            <h3 style="margin: 0 0 4px; font-size: 16px; color: #111827;">{$this->title}</h3>
            <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.5;">{$this->description}</p>
            {$footerHtml}
        </div>
        HTML;
    }

    public function renderRow(bool $striped = false): string {
        $bg = $striped ? 'background: #f9fafb;' : '';
        $iconHtml = $this->icon !== '' ? "<td style=\"padding: 8px; font-size: 20px;\">{$this->icon}</td>" : '';
        return <<<HTML
        <table style="width: 100%; border-collapse: collapse; font-family: system-ui;">
            <tr style="{$bg}">
                {$iconHtml}
                <td style="padding: 8px; font-weight: 600; color: #111827;">{$this->title}</td>
                <td style="padding: 8px; color: #6b7280;">{$this->description}</td>
            </tr>
        </table>
        HTML;
    }
}
