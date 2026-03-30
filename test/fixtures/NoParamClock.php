<?php
namespace App\Components;

class NoParamClock {
    public function __construct(
        private string $timezone = 'UTC',
        private string $format = 'H:i:s',
    ) {}

    public function render(): string {
        $tz = new \DateTimeZone($this->timezone);
        $now = new \DateTime('now', $tz);
        $time = $now->format($this->format);
        return "<div class=\"clock clock-{$this->timezone}\"><span class=\"clock-time\">{$time}</span></div>";
    }
}
