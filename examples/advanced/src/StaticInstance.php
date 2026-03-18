<?php
namespace App\Components;

/**
 * Demonstrates a class with both static factory methods AND instance methods.
 * Different stories can import different methods from the same class.
 */
class StaticInstance {
    public function __construct(
        private string $content,
        private string $type = 'info',
    ) {}

    public function render(): string {
        $colors = [
            'info'    => '#dbeafe',
            'success' => '#dcfce7',
            'warning' => '#fef3c7',
        ];
        $bg = $colors[$this->type] ?? '#f3f4f6';
        return "<div class=\"si-card si-card-{$this->type}\" style=\"padding: 12px 16px; background: {$bg}; border-radius: 8px; font-size: 14px;\">{$this->content}</div>";
    }

    public static function fromMarkdown(string $text, bool $bold = false): string {
        $escaped = htmlspecialchars($text);
        $html = $bold ? "<strong>{$escaped}</strong>" : $escaped;
        return "<div class=\"si-markdown\" style=\"padding: 12px 16px; background: #f8fafc; border-left: 3px solid #6366f1; border-radius: 4px; font-size: 14px;\">{$html}</div>";
    }
}
