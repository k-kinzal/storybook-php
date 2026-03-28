<?php

namespace App\Components;

trait HasAnimation {
    public function animate(string $content, string $effect = 'fade', int $duration = 300): string
    {
        return "<div class=\"animation animation-{$effect}\" style=\"animation-duration: {$duration}ms\">{$content}</div>";
    }
}

trait HasOverlay {
    public function overlay(string $content, string $opacity = '0.5'): string
    {
        return "<div class=\"overlay\" style=\"background: rgba(0,0,0,{$opacity})\">{$content}</div>";
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
        $body = $this->body ?? '';
        return "<div class=\"modal modal-{$this->size}\"><div class=\"modal-header\">{$this->title}</div><div class=\"modal-body\">{$body}</div></div>";
    }
}
