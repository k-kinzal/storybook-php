<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 readonly class (non-final).
 * All promoted properties are implicitly readonly.
 */
readonly class Settings {
    public function __construct(
        public string $theme = 'light',
        public int $fontSize = 14,
        public bool $animations = true,
    ) {}

    public function render(): string {
        $bg = $this->theme === 'dark' ? '#1f2937' : '#ffffff';
        $fg = $this->theme === 'dark' ? '#f3f4f6' : '#111827';
        $anim = $this->animations ? 'enabled' : 'disabled';
        return <<<HTML
        <div class="settings" style="background: {$bg}; color: {$fg}; padding: 16px; border-radius: 8px; border: 1px solid #d1d5db; font-family: system-ui;">
            <h3 style="margin: 0 0 12px 0;">Settings</h3>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: {$this->fontSize}px;">
                <div><strong>Theme:</strong> {$this->theme}</div>
                <div><strong>Font size:</strong> {$this->fontSize}px</div>
                <div><strong>Animations:</strong> {$anim}</div>
            </div>
        </div>
        HTML;
    }
}
