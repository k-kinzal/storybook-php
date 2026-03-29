<?php
namespace Tests\Fixtures;

interface Describable {
    public function describe(): string;
}

trait HasColorCode {
    public function colorCode(): string {
        return match($this) {
            self::Red => '#ef4444',
            self::Green => '#22c55e',
            self::Blue => '#3b82f6',
        };
    }
}

enum Palette: string implements Describable {
    use HasColorCode;

    case Red = 'red';
    case Green = 'green';
    case Blue = 'blue';

    public function describe(): string {
        return "{$this->name} ({$this->value})";
    }

    public function swatch(): string {
        return "<span class=\"swatch\" style=\"background:{$this->colorCode()};\">{$this->describe()}</span>";
    }
}
