<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 DNF (Disjunctive Normal Form) types.
 * DNF types combine intersections and unions: (A&B)|C
 *
 * Note: Complex type params like (Stringable&Countable)|string cannot be
 * instantiated from plain JSON args, so we use a simple string default.
 */
interface Labeled {
    public function label(): string;
}

interface Colored {
    public function color(): string;
}

class DnfParam {
    public function __construct(
        private string $title,
        private (Labeled&Colored)|string $badge = 'default',
        private bool $compact = false,
    ) {}

    public function render(): string {
        $badgeText = is_string($this->badge) ? $this->badge : $this->badge->label();
        $badgeColor = is_string($this->badge) ? '#6b7280' : $this->badge->color();
        $size = $this->compact ? 'padding: 8px 12px; font-size: 13px;' : 'padding: 12px 20px; font-size: 15px;';
        return <<<HTML
        <div class="dnf-param" style="{$size} border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui; display: inline-block;">
            <strong>{$this->title}</strong>
            <span style="margin-left: 8px; padding: 2px 8px; border-radius: 4px; background: {$badgeColor}; color: white; font-size: 11px;">{$badgeText}</span>
        </div>
        HTML;
    }
}
