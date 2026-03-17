<?php
namespace App\Components;

interface Labelable {
    public function label(): string;
}

enum Severity: string implements Labelable {
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
    case Critical = 'critical';

    public function label(): string {
        $colors = [
            'info' => '#3b82f6',
            'warning' => '#f59e0b',
            'error' => '#ef4444',
            'critical' => '#7f1d1d',
        ];
        $icons = [
            'info' => '&#x2139;',
            'warning' => '&#x26A0;',
            'error' => '&#x2716;',
            'critical' => '&#x1F525;',
        ];
        $color = $colors[$this->value] ?? '#6b7280';
        $icon = $icons[$this->value] ?? '';
        return "<span class=\"severity severity-{$this->value}\" style=\"background-color: {$color}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 13px;\">{$icon} {$this->name}</span>";
    }

    public function banner(string $message): string {
        $colors = [
            'info' => '#dbeafe',
            'warning' => '#fef3c7',
            'error' => '#fee2e2',
            'critical' => '#450a0a',
        ];
        $textColors = [
            'info' => '#1e40af',
            'warning' => '#92400e',
            'error' => '#991b1b',
            'critical' => '#fecaca',
        ];
        $bg = $colors[$this->value] ?? '#f3f4f6';
        $fg = $textColors[$this->value] ?? '#374151';
        return "<div class=\"banner banner-{$this->value}\" style=\"background-color: {$bg}; color: {$fg}; padding: 12px 16px; border-radius: 6px; font-size: 14px;\"><strong>{$this->name}:</strong> {$message}</div>";
    }
}
