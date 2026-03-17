<?php
namespace App\Components;

/**
 * Demonstrates a unit enum (no backing type) with static methods.
 * Unit enums don't use ::from() — cases are matched by name.
 */
enum Season {
    case Spring;
    case Summer;
    case Autumn;
    case Winter;

    public function emoji(): string {
        return match($this) {
            self::Spring => '&#x1F331;',
            self::Summer => '&#x2600;',
            self::Autumn => '&#x1F342;',
            self::Winter => '&#x2744;',
        };
    }

    public function label(): string {
        return match($this) {
            self::Spring => 'Spring',
            self::Summer => 'Summer',
            self::Autumn => 'Autumn',
            self::Winter => 'Winter',
        };
    }

    public function render(string $description = ''): string {
        $desc = $description !== '' ? "<p style=\"margin: 4px 0 0; color: #6b7280; font-size: 13px;\">{$description}</p>" : '';
        return "<div class=\"season season-{$this->name}\" style=\"display: inline-flex; align-items: center; gap: 8px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 8px; font-family: system-ui;\"><span style=\"font-size: 24px;\">{$this->emoji()}</span><div><strong>{$this->label()}</strong>{$desc}</div></div>";
    }

    public static function grid(): string {
        $cards = '';
        foreach (self::cases() as $case) {
            $cards .= $case->render();
        }
        return "<div class=\"season-grid\" style=\"display: flex; flex-wrap: wrap; gap: 12px;\">{$cards}</div>";
    }

    public static function current(string $hemisphere = 'north'): string {
        $month = (int) date('n');
        if ($hemisphere === 'south') {
            $month = (($month + 5) % 12) + 1;
        }
        $season = match(true) {
            $month >= 3 && $month <= 5 => self::Spring,
            $month >= 6 && $month <= 8 => self::Summer,
            $month >= 9 && $month <= 11 => self::Autumn,
            default => self::Winter,
        };
        return $season->render("Current season ({$hemisphere}ern hemisphere)");
    }
}
