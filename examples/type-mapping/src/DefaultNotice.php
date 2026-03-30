<?php

namespace App\Components;

/**
 * Runtime defaults + nullable example.
 *
 * limit has no PHP default, and subtitle is untyped. typeMap.files[*].args
 * supplies the runtime fallback behavior for missing Storybook args.
 */
class DefaultNotice
{
    public function __construct(
        private string $title,
        private int $limit,
        private $subtitle,
    ) {}

    public function render(): string
    {
        $subtitle = $this->subtitle === null ? 'No subtitle provided.' : (string) $this->subtitle;

        return "<aside style=\"font-family: system-ui; border-left: 4px solid #0f766e; background: #f0fdfa; padding: 16px; max-width: 420px;\"><strong style=\"display: block; margin-bottom: 6px;\">{$this->title}</strong><span style=\"display: block; color: #0f766e;\" data-limit=\"{$this->limit}\">{$subtitle}</span></aside>";
    }
}
