<?php
namespace App\Components;

/**
 * Demonstrates a class with a no-parameter render method.
 * Constructor has args but the callable itself takes no params.
 */
class NoParamClock {
    public function __construct(
        private string $timezone = 'UTC',
        private string $format = 'H:i:s',
    ) {}

    public function render(): string {
        $tz = new \DateTimeZone($this->timezone);
        $now = new \DateTime('2025-01-15 14:30:00', new \DateTimeZone('UTC'));
        $now->setTimezone($tz);
        $time = $now->format($this->format);
        return "<div class=\"clock clock-{$this->timezone}\" style=\"font-family: monospace; font-size: 24px; padding: 16px; background: #1e293b; color: #22d3ee; border-radius: 8px; display: inline-block;\"><span class=\"clock-time\">{$time}</span> <span class=\"clock-tz\" style=\"font-size: 12px; color: #94a3b8;\">{$this->timezone}</span></div>";
    }
}
