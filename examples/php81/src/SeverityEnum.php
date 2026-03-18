<?php
namespace App\Components;

/**
 * Demonstrates an enum with both instance methods and static factory methods.
 * The static methods return HTML directly, while instance methods use the case value.
 */
enum SeverityEnum: string {
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
    case Critical = 'critical';

    public function badge(): string {
        $colors = [
            'low'      => ['bg' => '#dcfce7', 'text' => '#166534'],
            'medium'   => ['bg' => '#fef9c3', 'text' => '#854d0e'],
            'high'     => ['bg' => '#ffedd5', 'text' => '#9a3412'],
            'critical' => ['bg' => '#fee2e2', 'text' => '#991b1b'],
        ];
        $c = $colors[$this->value];
        return "<span class=\"severity-badge\" style=\"display:inline-block;padding:4px 12px;border-radius:6px;background:{$c['bg']};color:{$c['text']};font-weight:600;font-size:13px;font-family:system-ui;\">{$this->name}</span>";
    }

    public static function all(string $separator = ' '): string {
        $badges = array_map(fn(self $s) => $s->badge(), self::cases());
        return '<div class="severity-list" style="display:flex;gap:8px;flex-wrap:wrap;">' . implode($separator, $badges) . '</div>';
    }

    public static function ofLevel(int $level, string $prefix = ''): string {
        $case = match(true) {
            $level >= 90 => self::Critical,
            $level >= 70 => self::High,
            $level >= 40 => self::Medium,
            default      => self::Low,
        };
        $badge = $case->badge();
        return $prefix !== '' ? "<div>{$prefix} {$badge}</div>" : $badge;
    }
}
