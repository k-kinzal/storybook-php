<?php
namespace App\Components;

/**
 * Demonstrates enum using traits (PHP 8.1+).
 * The parser and vite plugin must resolve trait methods for enums,
 * not just classes.
 */
trait HasBadge {
    public function badge(string $size = 'md'): string {
        $px = match($size) {
            'sm' => '4px 8px',
            'lg' => '8px 16px',
            default => '6px 12px',
        };
        return "<span style=\"padding: {$px};\">{$this->name}</span>";
    }
}

trait HasIcon {
    public function icon(): string {
        return "<i class=\"icon-{$this->value}\"></i>";
    }
}

enum Priority: string {
    use HasBadge;

    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';
}

enum Severity: string {
    use HasBadge, HasIcon;

    case Info = 'info';
    case Warning = 'warning';
    case Error = 'error';
}
