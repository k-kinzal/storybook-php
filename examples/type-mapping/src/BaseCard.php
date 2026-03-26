<?php

namespace App\Components;

/**
 * Base card class in a separate file.
 * Used to demonstrate typeMap.files[].includes for cross-file inheritance.
 */
abstract class BaseCard
{
    public function __construct(
        protected string $title,
        protected string $variant = 'default',
    ) {}

    abstract protected function body(): string;

    public function render(): string
    {
        $variants = [
            'default' => 'border: 1px solid #e5e7eb;',
            'primary' => 'border: 2px solid #3b82f6;',
            'success' => 'border: 2px solid #22c55e;',
        ];
        $style = $variants[$this->variant] ?? $variants['default'];
        return "<div style=\"{$style} border-radius: 8px; padding: 16px; font-family: system-ui;\"><h3 style=\"margin: 0 0 8px;\">{$this->title}</h3>{$this->body()}</div>";
    }
}
