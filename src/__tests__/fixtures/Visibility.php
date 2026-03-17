<?php

namespace App\Components;

enum Visibility: string {
    case Public = 'public';
    case Private = 'private';
    case Unlisted = 'unlisted';
    case Draft = 'draft';

    public function badge(): string
    {
        [$icon, $color, $label] = match ($this) {
            self::Public   => ['G', '#22c55e', 'Public'],
            self::Private  => ['L', '#ef4444', 'Private'],
            self::Unlisted => ['U', '#f59e0b', 'Unlisted'],
            self::Draft    => ['D', '#6b7280', 'Draft'],
        };

        return "<span class=\"visibility-badge visibility-{$this->value}\" style=\"color: {$color}\">{$icon} {$label}</span>";
    }

    public function description(): string
    {
        return match ($this) {
            self::Public   => '<p class="visibility-desc">Visible to everyone</p>',
            self::Private  => '<p class="visibility-desc">Only visible to you</p>',
            self::Unlisted => '<p class="visibility-desc">Accessible via direct link</p>',
            self::Draft    => '<p class="visibility-desc">Not yet published</p>',
        };
    }
}
