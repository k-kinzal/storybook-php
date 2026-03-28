<?php
namespace App\Components;

/**
 * Demonstrates a variety of default value types in a single class:
 * class constants, enum defaults, array literals, nullable, float, bool.
 */
enum Theme: string {
    case Light = 'light';
    case Dark = 'dark';
    case System = 'system';
}

class ThemeShowcase {
    public const DEFAULT_TITLE = 'Untitled';
    public const MAX_ITEMS = 10;

    public function __construct(
        private string $title = self::DEFAULT_TITLE,
        private int $maxItems = self::MAX_ITEMS,
        private float $opacity = 1.0,
        private bool $visible = true,
        private ?string $subtitle = null,
        private array $tags = ['general'],
        private Theme $theme = Theme::Light,
    ) {}

    public function render(): string {
        $themeStyles = [
            'light' => ['bg' => '#ffffff', 'text' => '#111827', 'border' => '#e5e7eb'],
            'dark'  => ['bg' => '#1f2937', 'text' => '#f9fafb', 'border' => '#374151'],
            'system' => ['bg' => '#f3f4f6', 'text' => '#374151', 'border' => '#d1d5db'],
        ];
        $s = $themeStyles[$this->theme->value];
        $vis = $this->visible ? '1' : '0.4';
        $sub = $this->subtitle ? "<div style=\"font-size: 13px; opacity: 0.7;\">{$this->subtitle}</div>" : '';
        $tagHtml = implode('', array_map(
            fn($t) => "<span style=\"display: inline-block; padding: 2px 8px; background: {$s['border']}; border-radius: 10px; font-size: 11px; margin-right: 4px;\">{$t}</span>",
            $this->tags
        ));
        return <<<HTML
        <div class="theme-showcase" style="padding: 16px; background: {$s['bg']}; color: {$s['text']}; border: 1px solid {$s['border']}; border-radius: 12px; font-family: system-ui; opacity: {$vis};">
            <h3 style="margin: 0 0 4px;">{$this->title}</h3>
            {$sub}
            <div style="margin-top: 8px; font-size: 12px; color: {$s['text']}; opacity: 0.6;">Max items: {$this->maxItems} &middot; Opacity: {$this->opacity}</div>
            <div style="margin-top: 8px;">{$tagHtml}</div>
        </div>
        HTML;
    }
}
