<?php
namespace App\Components;

class ConstantNotice {
    public const LEVEL_INFO = 'info';
    public const LEVEL_WARNING = 'warning';
    public const LEVEL_ERROR = 'error';
    public const LEVEL_SUCCESS = 'success';

    private const COLORS = [
        'info' => '#3b82f6',
        'warning' => '#f59e0b',
        'error' => '#ef4444',
        'success' => '#22c55e',
    ];

    public function __construct(
        private string $message,
        private string $level = self::LEVEL_INFO,
        private bool $closable = false,
    ) {}

    public function render(): string {
        $color = self::COLORS[$this->level] ?? '#6b7280';
        $close = $this->closable ? '<button style="float: right; background: none; border: none; cursor: pointer; font-size: 16px;">&times;</button>' : '';
        return "<div class=\"notice notice-{$this->level}\" style=\"padding: 12px 16px; border-left: 4px solid {$color}; background-color: {$color}1a; border-radius: 4px; font-size: 14px;\">{$close}{$this->message}</div>";
    }
}
