<?php
namespace App\Components;

class StaticInstance {
    public function __construct(
        private string $content,
        private string $type = 'info',
    ) {}

    public function render(): string {
        return "<div class=\"si-card si-card-{$this->type}\">{$this->content}</div>";
    }

    public static function fromMarkdown(string $text, bool $bold = false): string {
        $html = $bold ? "<strong>{$text}</strong>" : $text;
        return "<div class=\"si-markdown\">{$html}</div>";
    }
}
