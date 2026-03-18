<?php
namespace App\Components;

/**
 * Demonstrates enum with static methods.
 * Unlike instance methods (which require _case selection),
 * static methods on enums are called like static class methods.
 */
enum Compass: string {
    case North = 'N';
    case East = 'E';
    case South = 'S';
    case West = 'W';

    public function label(): string {
        return match($this) {
            self::North => 'North',
            self::East => 'East',
            self::South => 'South',
            self::West => 'West',
        };
    }

    public function arrow(): string {
        $rotation = match($this) {
            self::North => 0,
            self::East => 90,
            self::South => 180,
            self::West => 270,
        };
        return "<div class=\"compass\" style=\"display: inline-flex; flex-direction: column; align-items: center; gap: 4px; font-family: system-ui;\">
            <div style=\"width: 48px; height: 48px; border: 2px solid #374151; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate({$rotation}deg);\">
                <span style=\"font-size: 20px;\">↑</span>
            </div>
            <span style=\"font-size: 13px; font-weight: 600; color: #374151;\">{$this->label()} ({$this->value})</span>
        </div>";
    }

    public static function rose(string $highlight = 'N'): string {
        $html = '<div class="compass-rose" style="display: flex; gap: 16px; align-items: center; font-family: system-ui;">';
        foreach (self::cases() as $dir) {
            $isActive = $dir->value === $highlight;
            $bg = $isActive ? '#3b82f6' : '#f3f4f6';
            $color = $isActive ? 'white' : '#374151';
            $html .= "<span style=\"display: inline-block; width: 36px; height: 36px; line-height: 36px; text-align: center; border-radius: 50%; background: {$bg}; color: {$color}; font-weight: bold; font-size: 14px;\">{$dir->value}</span>";
        }
        $html .= '</div>';
        return $html;
    }
}
