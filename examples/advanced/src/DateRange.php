<?php
namespace App\Components;

/**
 * Demonstrates a class with object parameter defaults using `new` expressions.
 * PHP 8.1+ allows `new ClassName(...)` in parameter defaults.
 */
class DateConfig {
    public function __construct(
        public readonly string $format = 'Y-m-d',
        public readonly string $separator = ' to ',
    ) {}
}

class DateRange {
    public function __construct(
        private string $start,
        private string $end,
        private DateConfig $config = new DateConfig(),
    ) {}

    public function render(): string {
        $startDate = date($this->config->format, strtotime($this->start));
        $endDate = date($this->config->format, strtotime($this->end));
        return "<span class=\"date-range\" style=\"display: inline-flex; align-items: center; gap: 4px; padding: 6px 14px; border: 1px solid #d1d5db; border-radius: 6px; font-family: monospace; font-size: 14px;\"><time>{$startDate}</time><span style=\"color: #9ca3af;\">{$this->config->separator}</span><time>{$endDate}</time></span>";
    }
}
