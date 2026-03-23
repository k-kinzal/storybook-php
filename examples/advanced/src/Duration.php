<?php
namespace App\Components;

/**
 * Demonstrates __toString return pattern.
 * The runner detects __toString on the return object and converts it.
 */
class Duration {
    public function __construct(
        private int $hours = 0,
        private int $minutes = 0,
        private int $seconds = 0,
    ) {}

    public function __toString(): string {
        $parts = [];
        if ($this->hours > 0) {
            $parts[] = "{$this->hours}h";
        }
        if ($this->minutes > 0) {
            $parts[] = "{$this->minutes}m";
        }
        if ($this->seconds > 0 || empty($parts)) {
            $parts[] = "{$this->seconds}s";
        }
        $display = implode(' ', $parts);
        $totalSec = $this->hours * 3600 + $this->minutes * 60 + $this->seconds;
        $barWidth = min(100, intval($totalSec / 36)); // max ~1h fills bar
        return "<div class=\"duration\" style=\"font-family: system-ui; display: inline-flex; align-items: center; gap: 10px;\"><span style=\"font-size: 18px; font-weight: bold;\">{$display}</span><div style=\"width: 120px; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;\"><div style=\"width: {$barWidth}%; height: 100%; background: #3b82f6; border-radius: 3px;\"></div></div></div>";
    }

    public static function fromSeconds(int $totalSeconds): self {
        $h = intdiv($totalSeconds, 3600);
        $m = intdiv($totalSeconds % 3600, 60);
        $s = $totalSeconds % 60;
        return new self($h, $m, $s);
    }

    public function render(): self {
        return $this;
    }
}
