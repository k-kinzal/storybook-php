<?php

namespace App\Components;

class OverrideDefaults
{
    public function __construct(
        private string $title,
        private int $limit,
        private $subtitle,
    ) {}

    public function render(): string
    {
        $subtitle = $this->subtitle === null ? 'none' : (string) $this->subtitle;

        return "<section data-limit=\"{$this->limit}\"><h1>{$this->title}</h1><p>{$subtitle}</p></section>";
    }
}
