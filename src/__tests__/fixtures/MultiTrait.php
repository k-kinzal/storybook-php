<?php

namespace App\Components;

trait HasAnimation {
    public function animate(string $content, string $effect = 'fade', int $duration = 300): string
    {
        return "<div class=\"animation animation-{$effect}\">{$content}</div>";
    }
}

trait HasOverlay {
    public function overlay(string $content, string $opacity = '0.5'): string
    {
        return "<div class=\"overlay\">{$content}</div>";
    }
}

class Modal {
    use HasAnimation, HasOverlay;

    public function __construct(
        private string $title,
        private ?string $body = null,
        private string $size = 'md',
    ) {}

    public function render(): string
    {
        return "<div class=\"modal\">{$this->title}</div>";
    }
}
