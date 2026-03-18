<?php
namespace App\Components;

/**
 * Demonstrates constructor defaults using PHP constants and expressions.
 * Tests that the parser correctly captures constant names as default values
 * while the runner evaluates them at runtime via PHP reflection.
 */
class ConstExprDefaults {
    public function __construct(
        private string $title,
        private string $separator = PHP_EOL,
        private int $maxItems = PHP_INT_SIZE,
        private string $version = PHP_VERSION,
        private bool $debug = false,
    ) {}

    public function render(): string {
        $sepDisplay = match ($this->separator) {
            "\n" => '\\n (newline)',
            "\t" => '\\t (tab)',
            ', ' => 'comma-space',
            default => htmlspecialchars($this->separator),
        };

        return <<<HTML
        <div class="const-defaults" style="padding: 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: monospace; font-size: 13px;">
            <h4 style="margin: 0 0 12px 0; font-family: system-ui; font-size: 15px;">{$this->title}</h4>
            <dl style="margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 12px;">
                <dt style="color: #6b7280;">separator:</dt><dd style="margin: 0; color: #111827;">{$sepDisplay}</dd>
                <dt style="color: #6b7280;">maxItems:</dt><dd style="margin: 0; color: #111827;">{$this->maxItems}</dd>
                <dt style="color: #6b7280;">version:</dt><dd style="margin: 0; color: #111827;">{$this->version}</dd>
                <dt style="color: #6b7280;">debug:</dt><dd style="margin: 0; color: #111827;">{$this->debug}</dd>
            </dl>
        </div>
        HTML;
    }
}
