<?php
namespace App\Components;

/**
 * Unit enum with both instance and static methods.
 * No backing type — cases are matched by name.
 */
enum Direction {
    case North;
    case South;
    case East;
    case West;

    public function arrow(): string {
        return match($this) {
            self::North => '↑',
            self::South => '↓',
            self::East  => '→',
            self::West  => '←',
        };
    }

    public static function compass(): string {
        $parts = [];
        foreach (self::cases() as $case) {
            $parts[] = $case->arrow() . ' ' . $case->name;
        }
        return implode(' | ', $parts);
    }
}
