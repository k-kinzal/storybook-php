<?php

namespace App\Components;

class ValueCard {
    public function __construct(
        readonly string $label,
        readonly string $value,
        readonly string $unit = '',
        readonly ?string $trend = null,
    ) {}

    public function render(): string
    {
        $trendHtml = '';
        if ($this->trend !== null) {
            $cls = str_starts_with($this->trend, '+') ? 'trend-up' : 'trend-down';
            $trendHtml = " <span class=\"value-card-trend {$cls}\">{$this->trend}</span>";
        }
        $unitHtml = $this->unit !== '' ? "<span class=\"value-card-unit\">{$this->unit}</span>" : '';
        return "<div class=\"value-card\"><span class=\"value-card-label\">{$this->label}</span><span class=\"value-card-value\">{$this->value}{$unitHtml}</span>{$trendHtml}</div>";
    }
}
