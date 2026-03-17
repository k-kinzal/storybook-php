<?php
namespace App\Components;

/**
 * Demonstrates an enum using a trait that provides a static factory method.
 * The vite plugin resolves static methods from traits on enums.
 */
trait HasShowcase {
    public static function showcase(): string {
        $html = '<div class="showcase" style="display: flex; gap: 8px; flex-wrap: wrap;">';
        foreach (self::cases() as $case) {
            $html .= $case->swatch();
        }
        $html .= '</div>';
        return $html;
    }
}

enum Palette: string {
    use HasShowcase;

    case Rose = '#f43f5e';
    case Sky = '#0ea5e9';
    case Amber = '#f59e0b';
    case Emerald = '#10b981';
    case Violet = '#8b5cf6';

    public function swatch(): string {
        return <<<HTML
        <div class="swatch" style="
            width: 64px; height: 64px; border-radius: 10px;
            background: {$this->value}; display: flex; align-items: end;
            justify-content: center; padding-bottom: 6px;
        ">
            <span style="color: white; font-size: 11px; font-weight: 600; font-family: system-ui; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">{$this->name}</span>
        </div>
        HTML;
    }
}
