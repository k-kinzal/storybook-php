<?php

namespace App\Components;

class DynamicConstFetch
{
    public const string INFO = 'info';
    public const string WARNING = 'warning';
    public const string ERROR = 'error';

    private const array COLORS = [
        'INFO' => '#3b82f6',
        'WARNING' => '#f59e0b',
        'ERROR' => '#ef4444',
    ];

    public function __construct(
        private string $level = 'INFO',
        private string $message = 'System notification',
    ) {}

    public function render(): string
    {
        $value = self::{$this->level};
        $color = self::COLORS[$this->level] ?? '#6b7280';

        return <<<HTML
        <div class="alert" style="border-left: 4px solid {$color}; padding: 8px 12px;">
            <strong style="color: {$color};">[{$value}]</strong> {$this->message}
        </div>
        HTML;
    }
}
