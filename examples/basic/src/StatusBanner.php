<?php
namespace App\Components;

/**
 * Demonstrates class constants referenced in constructor defaults.
 * Constants define the allowed severity levels and default configuration.
 */
class StatusBanner {
    public const LEVEL_INFO = 'info';
    public const LEVEL_WARNING = 'warning';
    public const LEVEL_ERROR = 'error';
    public const LEVEL_SUCCESS = 'success';

    private const COLORS = [
        'info' => ['bg' => '#dbeafe', 'text' => '#1e40af', 'icon' => 'ℹ'],
        'warning' => ['bg' => '#fef3c7', 'text' => '#92400e', 'icon' => '⚠'],
        'error' => ['bg' => '#fee2e2', 'text' => '#991b1b', 'icon' => '✕'],
        'success' => ['bg' => '#dcfce7', 'text' => '#166534', 'icon' => '✓'],
    ];

    public function __construct(
        private string $message,
        private string $level = self::LEVEL_INFO,
        private bool $showIcon = true,
        private bool $dismissible = false,
    ) {}

    public function render(): string {
        $palette = self::COLORS[$this->level] ?? self::COLORS[self::LEVEL_INFO];
        $icon = $this->showIcon ? "<span style=\"margin-right: 8px; font-size: 16px;\">{$palette['icon']}</span>" : '';
        $dismiss = $this->dismissible ? '<button style="margin-left: auto; background: none; border: none; cursor: pointer; font-size: 16px; opacity: 0.6;">&times;</button>' : '';
        return "<div class=\"status-banner status-{$this->level}\" style=\"display: flex; align-items: center; padding: 12px 16px; border-radius: 8px; background: {$palette['bg']}; color: {$palette['text']}; font-family: system-ui;\">{$icon}<span>{$this->message}</span>{$dismiss}</div>";
    }
}
