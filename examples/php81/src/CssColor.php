<?php
namespace App\Components;

/**
 * Demonstrates an enum implementing an interface.
 * The enum cases provide Renderable::render() through the enum method.
 */
interface Renderable {
    public function render(): string;
}

enum CssColor: string implements Renderable {
    case Slate = '#64748b';
    case Rose = '#f43f5e';
    case Amber = '#f59e0b';
    case Emerald = '#10b981';
    case Sky = '#0ea5e9';
    case Violet = '#8b5cf6';

    public function render(): string {
        $textColor = match ($this) {
            self::Amber => '#111827',
            default => '#ffffff',
        };
        return <<<HTML
        <div class="css-color" style="display: inline-flex; align-items: center; gap: 12px; padding: 12px 20px; border-radius: 8px; background: {$this->value}; color: {$textColor}; font-family: system-ui;">
            <span style="width: 24px; height: 24px; border-radius: 4px; border: 2px solid rgba(255,255,255,0.3); background: {$this->value};"></span>
            <span style="font-weight: bold;">{$this->name}</span>
            <span style="opacity: 0.8;">{$this->value}</span>
        </div>
        HTML;
    }

    public function swatch(int $size = 48): string {
        return <<<HTML
        <div class="swatch" style="display: inline-flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="width: {$size}px; height: {$size}px; border-radius: 8px; background: {$this->value}; border: 2px solid rgba(0,0,0,0.1);"></div>
            <span style="font-size: 11px; color: #6b7280; font-family: system-ui;">{$this->value}</span>
        </div>
        HTML;
    }
}
