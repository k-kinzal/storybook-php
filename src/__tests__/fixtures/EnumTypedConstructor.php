<?php
namespace App\Fixtures;

enum Theme: string {
    case Light = 'light';
    case Dark = 'dark';
    case System = 'system';
}

class EnumTypedConstructor {
    public function __construct(
        private string $content,
        private Theme $theme = Theme::Light,
    ) {}

    public function render(): string {
        $bg = match($this->theme) {
            Theme::Light => '#ffffff',
            Theme::Dark => '#1f2937',
            Theme::System => '#f3f4f6',
        };
        $fg = match($this->theme) {
            Theme::Light => '#111827',
            Theme::Dark => '#f9fafb',
            Theme::System => '#374151',
        };
        return "<div class=\"themed themed-{$this->theme->value}\" style=\"background:{$bg};color:{$fg};padding:16px;\">{$this->content}</div>";
    }
}
