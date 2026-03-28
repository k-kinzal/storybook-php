<?php
namespace App\Components;

/**
 * Demonstrates a class with multiple instance methods,
 * each importable as a separate story callable via @method syntax.
 * Constructor args are shared across all method imports.
 */
class DateFormatter {
    public function __construct(
        private string $locale = 'en',
    ) {}

    public function format(string $date, string $style = 'medium'): string
    {
        $labels = [
            'en' => ['months' => ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']],
            'ja' => ['months' => ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']],
            'de' => ['months' => ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']],
        ];

        $parts = date_parse($date);
        $m = $labels[$this->locale]['months'][$parts['month'] - 1] ?? $parts['month'];
        $d = $parts['day'];
        $y = $parts['year'];

        $formatted = match ($style) {
            'short' => "{$m} {$d}",
            'long'  => "{$m} {$d}, {$y}",
            default => "{$d} {$m} {$y}",
        };

        return "<time class=\"date date-{$style}\" style=\"font-family: system-ui; font-size: 14px; color: #374151;\">{$formatted}</time>";
    }

    public function relative(string $date): string
    {
        $ts = strtotime($date);
        $now = strtotime('2025-03-15 12:00:00');
        $diff = $now - $ts;
        $abs = abs($diff);

        if ($abs < 60) {
            $label = 'just now';
        } elseif ($abs < 3600) {
            $mins = (int) ($abs / 60);
            $label = "{$mins} minute" . ($mins !== 1 ? 's' : '') . ($diff > 0 ? ' ago' : ' from now');
        } elseif ($abs < 86400) {
            $hours = (int) ($abs / 3600);
            $label = "{$hours} hour" . ($hours !== 1 ? 's' : '') . ($diff > 0 ? ' ago' : ' from now');
        } else {
            $days = (int) ($abs / 86400);
            $label = "{$days} day" . ($days !== 1 ? 's' : '') . ($diff > 0 ? ' ago' : ' from now');
        }

        return "<time class=\"date-relative\" style=\"font-family: system-ui; font-size: 14px; color: #6b7280;\">{$label}</time>";
    }

    public function calendar(string $date): string
    {
        $parts = date_parse($date);
        $y = $parts['year'];
        $m = $parts['month'];
        $d = $parts['day'];

        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, $m, $y);
        $firstDow = (int) date('w', mktime(0, 0, 0, $m, 1, $y));
        $monthName = date('F Y', mktime(0, 0, 0, $m, 1, $y));

        $html = "<div class=\"calendar\" style=\"font-family: system-ui; width: 280px;\">";
        $html .= "<div style=\"text-align: center; font-weight: 600; padding: 8px; color: #111827;\">{$monthName}</div>";
        $html .= "<div style=\"display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; text-align: center; font-size: 12px;\">";

        foreach (['Su','Mo','Tu','We','Th','Fr','Sa'] as $dow) {
            $html .= "<div style=\"padding: 4px; color: #9ca3af; font-weight: 600;\">{$dow}</div>";
        }

        for ($i = 0; $i < $firstDow; $i++) {
            $html .= "<div></div>";
        }

        for ($day = 1; $day <= $daysInMonth; $day++) {
            $isToday = ($day === $d);
            $bg = $isToday ? 'background: #3b82f6; color: white; border-radius: 50%;' : 'color: #374151;';
            $html .= "<div style=\"padding: 4px; {$bg}\">{$day}</div>";
        }

        $html .= "</div></div>";
        return $html;
    }
}
