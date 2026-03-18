<?php
namespace App\Components;

/**
 * Demonstrates PHP 8.2 standalone types: true, false, null.
 * Uses `true` and `false` as literal type hints for toggle parameters.
 */
class StandaloneTypes {
    public function __construct(
        private string $label,
        private string $variant = 'default',
        private true $visible = true,
        private false $disabled = false,
    ) {}

    public function render(): string {
        $colors = [
            'default' => '#6b7280',
            'primary' => '#3b82f6',
            'success' => '#22c55e',
            'danger'  => '#ef4444',
        ];
        $color = $colors[$this->variant] ?? '#6b7280';

        $opacity = $this->visible === true ? '1' : '0.5';
        $cursor = $this->disabled === false ? 'pointer' : 'not-allowed';

        return <<<HTML
        <button class="btn btn-{$this->variant}" style="
            display: inline-flex; align-items: center; padding: 8px 16px;
            background: {$color}; color: white; border: none; border-radius: 6px;
            font-size: 14px; cursor: {$cursor}; opacity: {$opacity};
            font-family: system-ui, sans-serif;
        ">{$this->label}</button>
        HTML;
    }
}
