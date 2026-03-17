<?php
namespace App\Components;

class NullableAlert {
    public function __construct(
        private string $message,
        private ?string $title = null,
        private ?string $icon = null,
        private ?string $action = null,
        private string $type = 'info',
    ) {}

    public function render(): string {
        $colors = [
            'info' => '#3b82f6',
            'warning' => '#f59e0b',
            'error' => '#ef4444',
            'success' => '#22c55e',
        ];
        $color = $colors[$this->type] ?? '#6b7280';

        $parts = [];
        if ($this->icon !== null) {
            $parts[] = "<span class=\"alert-icon\" style=\"font-size: 20px; margin-right: 8px;\">{$this->icon}</span>";
        }
        $textParts = [];
        if ($this->title !== null) {
            $textParts[] = "<strong style=\"display: block; margin-bottom: 2px;\">{$this->title}</strong>";
        }
        $textParts[] = "<span>{$this->message}</span>";
        $parts[] = '<div class="alert-text">' . implode('', $textParts) . '</div>';

        if ($this->action !== null) {
            $parts[] = "<a href=\"#\" class=\"alert-action\" style=\"margin-left: auto; color: {$color}; font-weight: 500; text-decoration: underline;\">{$this->action}</a>";
        }

        return "<div class=\"alert alert-{$this->type}\" style=\"display: flex; align-items: center; padding: 12px 16px; border: 1px solid {$color}33; background: {$color}0d; border-radius: 8px; font-size: 14px;\">" . implode('', $parts) . '</div>';
    }
}
