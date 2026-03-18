<?php
namespace App\Components;

/**
 * Demonstrates PHP 8 match expression as the primary rendering strategy.
 * Uses match for both layout selection and content rendering.
 */
class MatchPanel {
    public function __construct(
        private string $variant = 'default',
        private string $title = '',
        private string $content = '',
    ) {}

    public function render(): string {
        $layout = match ($this->variant) {
            'card' => $this->renderCard(),
            'banner' => $this->renderBanner(),
            'minimal' => $this->renderMinimal(),
            default => $this->renderDefault(),
        };

        return $layout;
    }

    private function renderDefault(): string {
        return <<<HTML
        <div class="match-panel" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px;">{$this->title}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">{$this->content}</p>
        </div>
        HTML;
    }

    private function renderCard(): string {
        return <<<HTML
        <div class="match-panel match-card" style="padding: 20px; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.08); font-family: system-ui;">
            <h3 style="margin: 0 0 8px; color: #111827;">{$this->title}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5;">{$this->content}</p>
        </div>
        HTML;
    }

    private function renderBanner(): string {
        return <<<HTML
        <div class="match-panel match-banner" style="padding: 20px 24px; background: linear-gradient(135deg, #1e3a5f, #2563eb); color: white; border-radius: 8px; font-family: system-ui;">
            <h3 style="margin: 0 0 6px; font-size: 20px;">{$this->title}</h3>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">{$this->content}</p>
        </div>
        HTML;
    }

    private function renderMinimal(): string {
        return <<<HTML
        <div class="match-panel match-minimal" style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-family: system-ui;">
            <strong style="font-size: 14px;">{$this->title}</strong>
            <span style="margin-left: 8px; color: #9ca3af; font-size: 13px;">{$this->content}</span>
        </div>
        HTML;
    }
}
