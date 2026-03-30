<?php
namespace App\Components;

class MixedOutput {
    public function __construct(
        private string $title,
        private string $content = '',
        private string $variant = 'info',
    ) {}

    public function render(): string {
        return "<div class=\"mixed-return\">{$this->title}: {$this->content}</div>";
    }

    public function renderEcho(): void {
        echo "<div class=\"mixed-echo\">";
        echo "<h4>{$this->title}</h4>";
        if ($this->content !== '') {
            echo "<p>{$this->content}</p>";
        }
        echo '</div>';
    }
}
