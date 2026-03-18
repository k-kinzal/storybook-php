<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 standalone `true`, `false`, and `null` types
 * as parameter type hints. These restrict parameters to specific
 * boolean/null values at the type level.
 */
class BoolToggle {
    public function __construct(
        private string $label = 'Feature',
        private string $activeColor = '#22c55e',
        private string $inactiveColor = '#ef4444',
    ) {}

    public function renderEnabled(true $state = true): string {
        return <<<HTML
        <div class="toggle-row" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-family: system-ui;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: {$this->activeColor};"></span>
            <span style="font-weight: 600; color: #111827;">{$this->label}</span>
            <span style="color: {$this->activeColor}; font-size: 13px;">Enabled</span>
        </div>
        HTML;
    }

    public function renderDisabled(false $state = false): string {
        return <<<HTML
        <div class="toggle-row" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-family: system-ui;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: {$this->inactiveColor};"></span>
            <span style="font-weight: 600; color: #111827;">{$this->label}</span>
            <span style="color: {$this->inactiveColor}; font-size: 13px;">Disabled</span>
        </div>
        HTML;
    }

    public static function renderNull(null $value = null): string {
        return <<<HTML
        <div class="toggle-row" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; font-family: system-ui;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #d1d5db;"></span>
            <span style="font-weight: 600; color: #9ca3af;">No value provided</span>
        </div>
        HTML;
    }
}
