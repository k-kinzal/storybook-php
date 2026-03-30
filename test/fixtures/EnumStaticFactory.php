<?php
namespace App\Components;

/**
 * Demonstrates an enum with static factory methods that return HTML.
 */
enum Severity: string {
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public function badge(): string {
        $colors = [
            'low'      => '#22c55e',
            'medium'   => '#eab308',
            'high'     => '#f97316',
            'critical' => '#ef4444',
        ];
        $color = $colors[$this->value];
        return "<span class=\"severity-badge\" style=\"background:{$color};color:white;padding:2px 8px;border-radius:4px;\">{$this->name}</span>";
    }

    public static function all(string $separator = ' '): string {
        $badges = array_map(fn(self $s) => $s->badge(), self::cases());
        return '<div class="severity-list">' . implode($separator, $badges) . '</div>';
    }

    public static function ofLevel(int $level): string {
        $case = match(true) {
            $level >= 90 => self::Critical,
            $level >= 70 => self::High,
            $level >= 40 => self::Medium,
            default      => self::Low,
        };
        return $case->badge();
    }
}
