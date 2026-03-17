<?php
namespace App\Components;

interface HasLabel {
    public function label(): string;
}

enum LogLevel: string implements HasLabel {
    case Debug = 'debug';
    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
    case Critical = 'critical';

    public function label(): string {
        return ucfirst($this->value);
    }

    public function badge(): string {
        $color = match ($this) {
            self::Debug    => '#6b7280',
            self::Info     => '#3b82f6',
            self::Warning  => '#f59e0b',
            self::Error    => '#ef4444',
            self::Critical => '#991b1b',
        };
        $icon = match ($this) {
            self::Debug    => '&#128736;',
            self::Info     => '&#8505;',
            self::Warning  => '&#9888;',
            self::Error    => '&#10060;',
            self::Critical => '&#128680;',
        };
        return "<span class=\"log-badge log-badge-{$this->value}\" style=\"display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 6px; background-color: {$color}; color: white; font-size: 13px; font-weight: 600;\">{$icon} {$this->label()}</span>";
    }

    public function entry(string $message, string $timestamp = ''): string {
        $time = $timestamp !== '' ? "<time style=\"color: #9ca3af; font-size: 12px; font-family: monospace;\">{$timestamp}</time> " : '';
        return "<div class=\"log-entry log-entry-{$this->value}\" style=\"display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-left: 3px solid; margin-bottom: 4px; font-family: monospace; font-size: 13px;\">{$time}{$this->badge()} <span>{$message}</span></div>";
    }
}
