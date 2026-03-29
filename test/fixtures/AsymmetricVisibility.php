<?php

namespace App\Components;

class AsymmetricVisibility
{
    public function __construct(
        public private(set) string $title = 'Untitled',
        public private(set) string $status = 'draft',
        public private(set) int $views = 0,
    ) {}

    public function render(): string
    {
        $statusColor = match ($this->status) {
            'published' => '#22c55e',
            'archived' => '#6b7280',
            default => '#f59e0b',
        };

        return <<<HTML
        <article class="post">
            <h2>{$this->title}</h2>
            <span style="color: {$statusColor};">{$this->status}</span>
            <span class="views">{$this->views} views</span>
        </article>
        HTML;
    }
}
