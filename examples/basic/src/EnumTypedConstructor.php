<?php
namespace App\Components;

enum Theme: string {
    case Light = 'light';
    case Dark = 'dark';
    case System = 'system';
}

/**
 * Demonstrates using an enum as a typed constructor parameter.
 * The runner auto-casts string values to enum instances.
 */
class EnumTypedConstructor {
    public function __construct(
        private string $content,
        private Theme $theme = Theme::Light,
        private string $size = 'md',
    ) {}

    public function render(): string {
        $themes = [
            'light'  => ['bg' => '#ffffff', 'fg' => '#111827', 'border' => '#e5e7eb'],
            'dark'   => ['bg' => '#1f2937', 'fg' => '#f9fafb', 'border' => '#374151'],
            'system' => ['bg' => '#f3f4f6', 'fg' => '#374151', 'border' => '#d1d5db'],
        ];
        $t = $themes[$this->theme->value] ?? $themes['light'];

        $sizes = ['sm' => '12px', 'md' => '16px', 'lg' => '20px'];
        $fontSize = $sizes[$this->size] ?? '16px';

        return <<<HTML
        <div class="themed themed-{$this->theme->value}" style="
            background: {$t['bg']}; color: {$t['fg']}; border: 1px solid {$t['border']};
            padding: 16px 20px; border-radius: 8px; font-size: {$fontSize};
            font-family: system-ui, sans-serif;
        ">{$this->content}</div>
        HTML;
    }
}
