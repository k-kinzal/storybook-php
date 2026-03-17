<?php
namespace App\Components;

/**
 * Demonstrates an enum method returning ['html' => string].
 * The runner resolves array returns with an 'html' key.
 */
enum EnumArrayReturn: string {
    case Success = 'success';
    case Warning = 'warning';
    case Error = 'error';

    /** Returns an array with 'html' key — the runner extracts it automatically. */
    public function card(string $message = ''): array {
        $config = match ($this) {
            self::Success => ['icon' => '&#x2705;', 'bg' => '#f0fdf4', 'border' => '#bbf7d0', 'color' => '#166534'],
            self::Warning => ['icon' => '&#x26A0;', 'bg' => '#fffbeb', 'border' => '#fde68a', 'color' => '#92400e'],
            self::Error   => ['icon' => '&#x274C;', 'bg' => '#fef2f2', 'border' => '#fecaca', 'color' => '#991b1b'],
        };
        $text = $message !== '' ? $message : "This is a {$this->value} notification.";

        return [
            'html' => <<<HTML
            <div class="enum-card enum-card-{$this->value}" style="display: flex; align-items: start; gap: 10px; padding: 14px 18px; background: {$config['bg']}; border: 1px solid {$config['border']}; border-radius: 8px; font-family: system-ui;">
                <span style="font-size: 18px;">{$config['icon']}</span>
                <div>
                    <strong style="color: {$config['color']}; text-transform: capitalize;">{$this->value}</strong>
                    <p style="margin: 4px 0 0; color: #374151; font-size: 14px;">{$text}</p>
                </div>
            </div>
            HTML,
        ];
    }
}
