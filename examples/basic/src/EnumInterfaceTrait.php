<?php
namespace App\Components;

/**
 * Demonstrates an enum that implements an interface AND uses a trait simultaneously.
 * Combines both composition mechanisms available to PHP 8.1 enums.
 */
interface Describable {
    public function describe(): string;
}

trait HasColorCode {
    public function colorCode(): string {
        return match($this) {
            self::Red => '#ef4444',
            self::Green => '#22c55e',
            self::Blue => '#3b82f6',
            self::Yellow => '#f59e0b',
        };
    }
}

enum Palette: string implements Describable {
    use HasColorCode;

    case Red = 'red';
    case Green = 'green';
    case Blue = 'blue';
    case Yellow = 'yellow';

    public function describe(): string {
        return "{$this->name} ({$this->value})";
    }

    public function swatch(string $size = '48px'): string {
        $color = $this->colorCode();
        $desc = $this->describe();
        return "<div class=\"palette-swatch\" style=\"display: inline-flex; flex-direction: column; align-items: center; gap: 6px; font-family: system-ui;\">
            <div style=\"width: {$size}; height: {$size}; background: {$color}; border-radius: 8px; border: 1px solid #d1d5db;\"></div>
            <span style=\"font-size: 12px; color: #374151;\">{$desc}</span>
        </div>";
    }
}
